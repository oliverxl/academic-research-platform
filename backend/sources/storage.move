module research_hub::storage {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::event;
    use research_hub::research_hub::{Self, Paper, Dataset};

    // Error codes
    const EInvalidFileSize: u64 = 0;
    const EInvalidFileHash: u64 = 1;

    // Maximum file size (100MB)
    const MAX_FILE_SIZE: u64 = 100 * 1024 * 1024;

    // Events
    struct FileStoredEvent has copy, drop {
        file_id: address,
        owner: address,
        file_hash: String,
        file_size: u64
    }

    struct FileRetrievedEvent has copy, drop {
        file_id: address,
        user: address
    }

    // File metadata
    struct FileMetadata has key, store {
        id: UID,
        owner: address,
        file_hash: String,
        file_size: u64,
        mime_type: String,
        created_at: u64
    }

    // === File Storage ===

    public entry fun store_file(
        file_hash: String,
        file_size: u64,
        mime_type: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Validate file size
        assert!(file_size > 0 && file_size <= MAX_FILE_SIZE, EInvalidFileSize);
        
        // Validate file hash (should be non-empty)
        assert!(string::length(&file_hash) > 0, EInvalidFileHash);
        
        let file_id = object::new(ctx);
        let file_address = object::uid_to_address(&file_id);
        
        let metadata = FileMetadata {
            id: file_id,
            owner: sender,
            file_hash,
            file_size,
            mime_type,
            created_at: tx_context::epoch(ctx)
        };
        
        event::emit(FileStoredEvent {
            file_id: file_address,
            owner: sender,
            file_hash,
            file_size
        });
        
        transfer::transfer(metadata, sender);
    }

    // === Walrus Integration ===

    // This function would be called by the frontend to get the Walrus storage URL for a file
    public fun get_walrus_url(file_hash: &String): String {
        // In a real implementation, this would construct a URL to access the file from Walrus
        // For now, we'll just return a placeholder
        let prefix = string::utf8(b"https://walrus.storage/");
        string::append(&mut prefix, *file_hash);
        prefix
    }

    // This function simulates retrieving a file from Walrus storage
    public entry fun retrieve_file(
        metadata: &FileMetadata,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // In a real implementation, this would interact with Walrus to retrieve the file
        // For now, we'll just emit an event
        event::emit(FileRetrievedEvent {
            file_id: object::uid_to_address(&metadata.id),
            user: sender
        });
    }

    // === Helper Functions ===

    public fun get_file_details(metadata: &FileMetadata): (address, String, u64, String) {
        (
            metadata.owner,
            metadata.file_hash,
            metadata.file_size,
            metadata.mime_type
        )
    }

    public fun is_owner(metadata: &FileMetadata, user: address): bool {
        metadata.owner == user
    }
}
