module research_hub::research_hub {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::vec_map::{Self, VecMap};
    use sui::vec_set::{Self, VecSet};
    use std::string::{Self, String};
    use std::vector;
    use sui::event;
    use sui::package;
    use sui::display;
    use sui::dynamic_field as df;

    // Error codes
    const ENotAuthorized: u64 = 0;
    const EResourceNotFound: u64 = 1;
    const EInvalidPermissionLevel: u64 = 2;
    const ECitationCounterNotFound: u64 = 3;

    // Permission levels
    const PERMISSION_READ: u8 = 1;
    const PERMISSION_COMMENT: u8 = 2;
    const PERMISSION_EDIT: u8 = 3;

    // Resource types
    const RESOURCE_TYPE_PAPER: u8 = 1;
    const RESOURCE_TYPE_DATASET: u8 = 2;

    // One-Time-Witness for the package
    struct RESEARCH_HUB has drop {}

    // Dynamic field keys
    struct CitationCounterKey has copy, drop, store {}
    struct CommentKey has copy, drop, store {}

    // Capability for administrative operations
    struct AdminCap has key, store {
        id: UID
    }

    // User profile
    struct User has key, store {
        id: UID,
        name: String,
        email: String,
        institution: String,
        created_at: u64,
        updated_at: u64
    }

    // Research paper
    struct Paper has key, store {
        id: UID,
        owner: address,
        title: String,
        abstract: String,
        authors: vector<String>,
        keywords: vector<String>,
        file_hash: String,
        file_size: u64,
        is_public: bool,
        created_at: u64,
        updated_at: u64
    }

    // Dataset
    struct Dataset has key, store {
        id: UID,
        owner: address,
        title: String,
        description: String,
        authors: vector<String>,
        keywords: vector<String>,
        file_hash: String,
        file_size: u64,
        is_public: bool,
        created_at: u64,
        updated_at: u64
    }

    // Access permission
    struct Permission has store, drop {
        user: address,
        permission_level: u8,
        expiration: Option<u64>
    }

    // Access control list for a resource
    struct AccessControl has key, store {
        id: UID,
        resource_id: address,
        resource_type: u8,
        owner: address,
        permissions: Table<address, Permission>
    }

    // Events
    struct UserRegisteredEvent has copy, drop {
        user_id: address,
        name: String,
        institution: String
    }

    struct PaperUploadedEvent has copy, drop {
        paper_id: address,
        owner: address,
        title: String,
        is_public: bool
    }

    struct DatasetUploadedEvent has copy, drop {
        dataset_id: address,
        owner: address,
        title: String,
        is_public: bool
    }

    struct AccessGrantedEvent has copy, drop {
        resource_id: address,
        owner: address,
        user: address,
        permission_level: u8
    }

    struct AccessRevokedEvent has copy, drop {
        resource_id: address,
        owner: address,
        user: address
    }

    // === Initialization ===

    fun init(otw: RESEARCH_HUB, ctx: &mut TxContext) {
        // Create and transfer AdminCap to the deployer
        let admin_cap = AdminCap {
            id: object::new(ctx)
        };
        transfer::transfer(admin_cap, tx_context::sender(ctx));

        // Set up display for User
        let publisher = package::claim(otw, ctx);
        let user_display = display::new_with_fields<User>(
            &publisher,
            vector[
                string::utf8(b"name"), string::utf8(b"{name}"),
                string::utf8(b"institution"), string::utf8(b"{institution}"),
                string::utf8(b"description"), string::utf8(b"Academic researcher profile")
            ],
            ctx
        );
        display::update_version(&mut user_display);

        // Set up display for Paper
        let paper_display = display::new_with_fields<Paper>(
            &publisher,
            vector[
                string::utf8(b"name"), string::utf8(b"{title}"),
                string::utf8(b"description"), string::utf8(b"{abstract}"),
                string::utf8(b"type"), string::utf8(b"Research Paper")
            ],
            ctx
        );
        display::update_version(&mut paper_display);

        // Set up display for Dataset
        let dataset_display = display::new_with_fields<Dataset>(
            &publisher,
            vector[
                string::utf8(b"name"), string::utf8(b"{title}"),
                string::utf8(b"description"), string::utf8(b"{description}"),
                string::utf8(b"type"), string::utf8(b"Research Dataset")
            ],
            ctx
        );
        display::update_version(&mut dataset_display);

        // Transfer displays
        transfer::public_transfer(publisher, tx_context::sender(ctx));
        transfer::public_transfer(user_display, tx_context::sender(ctx));
        transfer::public_transfer(paper_display, tx_context::sender(ctx));
        transfer::public_transfer(dataset_display, tx_context::sender(ctx));
    }

    // === User Management ===

    public entry fun register_user(
        name: String,
        email: String,
        institution: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        let user = User {
            id: object::new(ctx),
            name,
            email,
            institution,
            created_at: timestamp,
            updated_at: timestamp
        };

        event::emit(UserRegisteredEvent {
            user_id: object::uid_to_address(&user.id),
            name: user.name,
            institution: user.institution
        });

        transfer::transfer(user, sender);
    }

    public entry fun update_user_profile(
        user: &mut User,
        name: Option<String>,
        email: Option<String>,
        institution: Option<String>,
        ctx: &mut TxContext
    ) {
        let timestamp = tx_context::epoch(ctx);

        if (option::is_some(&name)) {
            user.name = option::destroy_some(name);
        };

        if (option::is_some(&email)) {
            user.email = option::destroy_some(email);
        };

        if (option::is_some(&institution)) {
            user.institution = option::destroy_some(institution);
        };

        user.updated_at = timestamp;
    }

    // === Research Paper Management ===

    public entry fun upload_paper(
        title: String,
        abstract: String,
        authors: vector<String>,
        keywords: vector<String>,
        file_hash: String,
        file_size: u64,
        is_public: bool,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        let paper_id = object::new(ctx);
        let paper_address = object::uid_to_address(&paper_id);

        let paper = Paper {
            id: paper_id,
            owner: sender,
            title,
            abstract,
            authors,
            keywords,
            file_hash,
            file_size,
            is_public,
            created_at: timestamp,
            updated_at: timestamp
        };

        // Create access control for the paper
        let access_control = AccessControl {
            id: object::new(ctx),
            resource_id: paper_address,
            resource_type: RESOURCE_TYPE_PAPER,
            owner: sender,
            permissions: table::new(ctx)
        };

        event::emit(PaperUploadedEvent {
            paper_id: paper_address,
            owner: sender,
            title: paper.title,
            is_public
        });

        transfer::transfer(paper, sender);
        transfer::transfer(access_control, sender);
    }

    public entry fun update_paper(
        paper: &mut Paper,
        title: Option<String>,
        abstract: Option<String>,
        authors: Option<vector<String>>,
        keywords: Option<vector<String>>,
        file_hash: Option<String>,
        file_size: Option<u64>,
        is_public: Option<bool>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(paper.owner == sender, ENotAuthorized);

        let timestamp = tx_context::epoch(ctx);

        if (option::is_some(&title)) {
            paper.title = option::destroy_some(title);
        };

        if (option::is_some(&abstract)) {
            paper.abstract = option::destroy_some(abstract);
        };

        if (option::is_some(&authors)) {
            paper.authors = option::destroy_some(authors);
        };

        if (option::is_some(&keywords)) {
            paper.keywords = option::destroy_some(keywords);
        };

        if (option::is_some(&file_hash)) {
            paper.file_hash = option::destroy_some(file_hash);
        };

        if (option::is_some(&file_size)) {
            paper.file_size = option::destroy_some(file_size);
        };

        if (option::is_some(&is_public)) {
            paper.is_public = option::destroy_some(is_public);
        };

        paper.updated_at = timestamp;
    }

    // === Dataset Management ===

    public entry fun upload_dataset(
        title: String,
        description: String,
        authors: vector<String>,
        keywords: vector<String>,
        file_hash: String,
        file_size: u64,
        is_public: bool,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        let dataset_id = object::new(ctx);
        let dataset_address = object::uid_to_address(&dataset_id);

        let dataset = Dataset {
            id: dataset_id,
            owner: sender,
            title,
            description,
            authors,
            keywords,
            file_hash,
            file_size,
            is_public,
            created_at: timestamp,
            updated_at: timestamp
        };

        // Create access control for the dataset
        let access_control = AccessControl {
            id: object::new(ctx),
            resource_id: dataset_address,
            resource_type: RESOURCE_TYPE_DATASET,
            owner: sender,
            permissions: table::new(ctx)
        };

        event::emit(DatasetUploadedEvent {
            dataset_id: dataset_address,
            owner: sender,
            title: dataset.title,
            is_public
        });

        transfer::transfer(dataset, sender);
        transfer::transfer(access_control, sender);
    }

    public entry fun update_dataset(
        dataset: &mut Dataset,
        title: Option<String>,
        description: Option<String>,
        authors: Option<vector<String>>,
        keywords: Option<vector<String>>,
        file_hash: Option<String>,
        file_size: Option<u64>,
        is_public: Option<bool>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(dataset.owner == sender, ENotAuthorized);

        let timestamp = tx_context::epoch(ctx);

        if (option::is_some(&title)) {
            dataset.title = option::destroy_some(title);
        };

        if (option::is_some(&description)) {
            dataset.description = option::destroy_some(description);
        };

        if (option::is_some(&authors)) {
            dataset.authors = option::destroy_some(authors);
        };

        if (option::is_some(&keywords)) {
            dataset.keywords = option::destroy_some(keywords);
        };

        if (option::is_some(&file_hash)) {
            dataset.file_hash = option::destroy_some(file_hash);
        };

        if (option::is_some(&file_size)) {
            dataset.file_size = option::destroy_some(file_size);
        };

        if (option::is_some(&is_public)) {
            dataset.is_public = option::destroy_some(is_public);
        };

        dataset.updated_at = timestamp;
    }

    // === Access Control ===

    public entry fun grant_access(
        access_control: &mut AccessControl,
        user: address,
        permission_level: u8,
        expiration: Option<u64>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Only the owner can grant access
        assert!(access_control.owner == sender, ENotAuthorized);

        // Validate permission level
        assert!(
            permission_level == PERMISSION_READ ||
            permission_level == PERMISSION_COMMENT ||
            permission_level == PERMISSION_EDIT,
            EInvalidPermissionLevel
        );

        let permission = Permission {
            user,
            permission_level,
            expiration
        };

        if (table::contains(&access_control.permissions, user)) {
            table::remove(&mut access_control.permissions, user);
        };

        table::add(&mut access_control.permissions, user, permission);

        event::emit(AccessGrantedEvent {
            resource_id: access_control.resource_id,
            owner: sender,
            user,
            permission_level
        });
    }

    public entry fun revoke_access(
        access_control: &mut AccessControl,
        user: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Only the owner can revoke access
        assert!(access_control.owner == sender, ENotAuthorized);

        // Check if the user has access
        assert!(table::contains(&access_control.permissions, user), EResourceNotFound);

        table::remove(&mut access_control.permissions, user);

        event::emit(AccessRevokedEvent {
            resource_id: access_control.resource_id,
            owner: sender,
            user
        });
    }

    // === Citation Functions ===

    public fun citation_counter_exists(paper_id: address): bool {
        let paper_exists = exists<Paper>(paper_id);
        if (!paper_exists) {
            return false
        };

        let paper = borrow_global<Paper>(paper_id);
        df::exists_(&paper.id, CitationCounterKey{})
    }

    public fun borrow_mut_citation_counter(paper_id: address, ctx: &mut TxContext): &mut citation::CitationCounter {
        let paper_exists = exists<Paper>(paper_id);
        assert!(paper_exists, EResourceNotFound);

        let paper = borrow_global_mut<Paper>(paper_id);
        assert!(df::exists_(&paper.id, CitationCounterKey{}), ECitationCounterNotFound);

        df::borrow_mut<CitationCounterKey, citation::CitationCounter>(&mut paper.id, CitationCounterKey{})
    }

    public fun is_paper_owner(paper: &Paper, user: address): bool {
        paper.owner == user
    }

    public fun is_dataset_owner(dataset: &Dataset, user: address): bool {
        dataset.owner == user
    }

    // === Helper Functions ===

    public fun has_access(
        access_control: &AccessControl,
        user: address,
        required_permission: u8
    ): bool {
        // Owner always has full access
        if (access_control.owner == user) {
            return true
        };

        // Check if user has explicit permission
        if (table::contains(&access_control.permissions, user)) {
            let permission = table::borrow(&access_control.permissions, user);

            // Check if permission has expired
            if (option::is_some(&permission.expiration)) {
                let expiration = option::destroy_some(permission.expiration);
                if (expiration < tx_context::epoch(ctx)) {
                    return false
                };
            };

            return permission.permission_level >= required_permission
        };

        false
    }

    public fun is_public_paper(paper: &Paper): bool {
        paper.is_public
    }

    public fun is_public_dataset(dataset: &Dataset): bool {
        dataset.is_public
    }

    // === Getters ===

    public fun get_paper_owner(paper: &Paper): address {
        paper.owner
    }

    public fun get_dataset_owner(dataset: &Dataset): address {
        dataset.owner
    }

    public fun get_paper_details(paper: &Paper): (String, String, vector<String>, vector<String>, String, u64, bool) {
        (
            paper.title,
            paper.abstract,
            paper.authors,
            paper.keywords,
            paper.file_hash,
            paper.file_size,
            paper.is_public
        )
    }

    public fun get_dataset_details(dataset: &Dataset): (String, String, vector<String>, vector<String>, String, u64, bool) {
        (
            dataset.title,
            dataset.description,
            dataset.authors,
            dataset.keywords,
            dataset.file_hash,
            dataset.file_size,
            dataset.is_public
        )
    }
}
