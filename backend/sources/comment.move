module research_hub::comment {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};
    use std::vector;
    use research_hub::research_hub::{Self, Paper, Dataset};
    use research_hub::access_control::{Self};

    // Error codes
    const ENotAuthorized: u64 = 0;
    const ECommentNotFound: u64 = 1;
    const EInvalidResourceType: u64 = 2;

    // Resource types (must match those in research_hub.move)
    const RESOURCE_TYPE_PAPER: u8 = 1;
    const RESOURCE_TYPE_DATASET: u8 = 2;

    // Comment
    struct Comment has key, store {
        id: UID,
        resource_id: address,
        resource_type: u8,
        author: address,
        content: String,
        created_at: u64,
        updated_at: u64,
    }

    // Comment thread for a resource
    struct CommentThread has key, store {
        id: UID,
        resource_id: address,
        resource_type: u8,
        comments: Table<address, Comment>,
        comment_count: u64,
    }

    // Events
    struct CommentAddedEvent has copy, drop {
        comment_id: address,
        resource_id: address,
        resource_type: u8,
        author: address,
        created_at: u64,
    }

    struct CommentUpdatedEvent has copy, drop {
        comment_id: address,
        resource_id: address,
        author: address,
        updated_at: u64,
    }

    struct CommentRemovedEvent has copy, drop {
        comment_id: address,
        resource_id: address,
        author: address,
    }

    // === Comment Management ===

    public entry fun add_comment_to_paper(
        paper: &Paper,
        content: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let paper_id = object::uid_to_address(&paper.id);
        
        // Verify that the sender has comment permission
        assert!(
            research_hub::is_paper_owner(paper, sender) || 
            access_control::has_comment_permission(paper_id, sender),
            ENotAuthorized
        );
        
        add_comment_internal(paper_id, RESOURCE_TYPE_PAPER, content, ctx);
    }

    public entry fun add_comment_to_dataset(
        dataset: &Dataset,
        content: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let dataset_id = object::uid_to_address(&dataset.id);
        
        // Verify that the sender has comment permission
        assert!(
            research_hub::is_dataset_owner(dataset, sender) || 
            access_control::has_comment_permission(dataset_id, sender),
            ENotAuthorized
        );
        
        add_comment_internal(dataset_id, RESOURCE_TYPE_DATASET, content, ctx);
    }

    public entry fun update_comment(
        comment: &mut Comment,
        content: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify that the sender is the author of the comment
        assert!(comment.author == sender, ENotAuthorized);
        
        let timestamp = tx_context::epoch(ctx);
        
        // Update comment
        comment.content = content;
        comment.updated_at = timestamp;
        
        // Emit event
        event::emit(CommentUpdatedEvent {
            comment_id: object::uid_to_address(&comment.id),
            resource_id: comment.resource_id,
            author: sender,
            updated_at: timestamp,
        });
    }

    public entry fun remove_comment(
        thread: &mut CommentThread,
        comment_id: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Verify that the comment exists
        assert!(table::contains(&thread.comments, comment_id), ECommentNotFound);
        
        // Get the comment
        let comment = table::borrow(&thread.comments, comment_id);
        
        // Verify that the sender is the author of the comment or the resource owner
        assert!(
            comment.author == sender || 
            is_resource_owner(comment.resource_id, comment.resource_type, sender),
            ENotAuthorized
        );
        
        // Remove the comment
        let removed_comment = table::remove(&mut thread.comments, comment_id);
        thread.comment_count = thread.comment_count - 1;
        
        // Emit event
        event::emit(CommentRemovedEvent {
            comment_id,
            resource_id: removed_comment.resource_id,
            author: removed_comment.author,
        });
        
        // Delete the comment
        let Comment { 
            id, 
            resource_id: _, 
            resource_type: _, 
            author: _, 
            content: _, 
            created_at: _, 
            updated_at: _ 
        } = removed_comment;
        object::delete(id);
    }

    // === Helper Functions ===

    fun add_comment_internal(
        resource_id: address,
        resource_type: u8,
        content: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);
        
        // Create comment
        let comment_id = object::new(ctx);
        let comment_address = object::uid_to_address(&comment_id);
        
        let comment = Comment {
            id: comment_id,
            resource_id,
            resource_type,
            author: sender,
            content,
            created_at: timestamp,
            updated_at: timestamp,
        };
        
        // Get or create comment thread
        let thread_exists = comment_thread_exists(resource_id, resource_type);
        
        if (thread_exists) {
            // Add comment to existing thread
            let thread = borrow_mut_comment_thread(resource_id, resource_type);
            table::add(&mut thread.comments, comment_address, comment);
            thread.comment_count = thread.comment_count + 1;
        } else {
            // Create new thread
            let thread_id = object::new(ctx);
            let mut comments = table::new<address, Comment>(ctx);
            table::add(&mut comments, comment_address, comment);
            
            let thread = CommentThread {
                id: thread_id,
                resource_id,
                resource_type,
                comments,
                comment_count: 1,
            };
            
            // Share the thread
            transfer::share_object(thread);
        };
        
        // Emit event
        event::emit(CommentAddedEvent {
            comment_id: comment_address,
            resource_id,
            resource_type,
            author: sender,
            created_at: timestamp,
        });
    }

    fun is_resource_owner(resource_id: address, resource_type: u8, user: address): bool {
        if (resource_type == RESOURCE_TYPE_PAPER) {
            let paper_exists = exists<research_hub::Paper>(resource_id);
            if (!paper_exists) {
                return false
            };
            
            let paper = borrow_global<research_hub::Paper>(resource_id);
            return paper.owner == user
        } else if (resource_type == RESOURCE_TYPE_DATASET) {
            let dataset_exists = exists<research_hub::Dataset>(resource_id);
            if (!dataset_exists) {
                return false
            };
            
            let dataset = borrow_global<research_hub::Dataset>(resource_id);
            return dataset.owner == user
        } else {
            abort EInvalidResourceType
        }
    }

    fun comment_thread_exists(resource_id: address, resource_type: u8): bool {
        exists<CommentThread>(resource_id)
    }

    fun borrow_mut_comment_thread(resource_id: address, resource_type: u8): &mut CommentThread {
        borrow_global_mut<CommentThread>(resource_id)
    }

    // === Public Accessors ===

    public fun get_comment_details(comment: &Comment): (address, u8, address, String, u64, u64) {
        (
            comment.resource_id,
            comment.resource_type,
            comment.author,
            comment.content,
            comment.created_at,
            comment.updated_at
        )
    }

    public fun get_comment_count(thread: &CommentThread): u64 {
        thread.comment_count
    }
}
