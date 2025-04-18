module research_hub::access_control {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use std::string::{Self, String};
    use sui::event;
    use research_hub::research_hub::{Self, Paper, Dataset};

    // Error codes
    const ENotAuthorized: u64 = 0;
    const EResourceNotFound: u64 = 1;
    const EInvalidPermissionLevel: u64 = 2;

    // Permission levels
    const PERMISSION_READ: u8 = 1;
    const PERMISSION_COMMENT: u8 = 2;
    const PERMISSION_EDIT: u8 = 3;

    // Events
    struct SealCreatedEvent has copy, drop {
        seal_id: address,
        owner: address,
        resource_id: address
    }

    struct SealOpenedEvent has copy, drop {
        seal_id: address,
        user: address
    }

    // SEAL (Secure Encrypted Access Layer)
    // This is a simplified version of Mysten Labs' SEAL protocol for access control
    struct Seal has key, store {
        id: UID,
        owner: address,
        resource_id: address,
        encryption_key: vector<u8>,
        authorized_users: Table<address, vector<u8>>,
        created_at: u64
    }

    // === SEAL Management ===

    public entry fun create_seal(
        resource_id: address,
        encryption_key: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        let seal_id = object::new(ctx);
        let seal_address = object::uid_to_address(&seal_id);

        let seal = Seal {
            id: seal_id,
            owner: sender,
            resource_id,
            encryption_key,
            authorized_users: table::new(ctx),
            created_at: tx_context::epoch(ctx)
        };

        event::emit(SealCreatedEvent {
            seal_id: seal_address,
            owner: sender,
            resource_id
        });

        transfer::transfer(seal, sender);
    }

    public entry fun authorize_user(
        seal: &mut Seal,
        user: address,
        encrypted_key: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Only the owner can authorize users
        assert!(seal.owner == sender, ENotAuthorized);

        if (table::contains(&seal.authorized_users, user)) {
            table::remove(&mut seal.authorized_users, user);
        };

        table::add(&mut seal.authorized_users, user, encrypted_key);
    }

    public entry fun revoke_user(
        seal: &mut Seal,
        user: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Only the owner can revoke users
        assert!(seal.owner == sender, ENotAuthorized);

        // Check if the user is authorized
        assert!(table::contains(&seal.authorized_users, user), EResourceNotFound);

        table::remove(&mut seal.authorized_users, user);
    }

    public entry fun open_seal(
        seal: &Seal,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Check if the user is authorized or is the owner
        assert!(
            seal.owner == sender || table::contains(&seal.authorized_users, sender),
            ENotAuthorized
        );

        event::emit(SealOpenedEvent {
            seal_id: object::uid_to_address(&seal.id),
            user: sender
        });

        // In a real implementation, this would return the decryption key to the client
        // For now, we just emit an event
    }

    // === Permission Functions ===

    public fun has_read_permission(resource_id: address, user: address): bool {
        // Check if the resource exists in research_hub
        let paper_exists = exists<research_hub::Paper>(resource_id);
        let dataset_exists = exists<research_hub::Dataset>(resource_id);

        if (!paper_exists && !dataset_exists) {
            return false
        };

        // Check if the user is the owner
        if (paper_exists) {
            let paper = borrow_global<research_hub::Paper>(resource_id);
            if (paper.owner == user) {
                return true
            };

            // Check if the paper is public
            if (paper.is_public) {
                return true
            };
        } else if (dataset_exists) {
            let dataset = borrow_global<research_hub::Dataset>(resource_id);
            if (dataset.owner == user) {
                return true
            };

            // Check if the dataset is public
            if (dataset.is_public) {
                return true
            };
        };

        // Check if the user has explicit permission through access control
        let access_control_exists = exists<research_hub::AccessControl>(resource_id);
        if (!access_control_exists) {
            return false
        };

        let access_control = borrow_global<research_hub::AccessControl>(resource_id);
        if (table::contains(&access_control.permissions, user)) {
            let permission = table::borrow(&access_control.permissions, user);
            return permission.permission_level >= PERMISSION_READ
        };

        false
    }

    public fun has_comment_permission(resource_id: address, user: address): bool {
        // Check if the user has read permission first
        if (!has_read_permission(resource_id, user)) {
            return false
        };

        // Check if the user is the owner
        let paper_exists = exists<research_hub::Paper>(resource_id);
        let dataset_exists = exists<research_hub::Dataset>(resource_id);

        if (paper_exists) {
            let paper = borrow_global<research_hub::Paper>(resource_id);
            if (paper.owner == user) {
                return true
            };
        } else if (dataset_exists) {
            let dataset = borrow_global<research_hub::Dataset>(resource_id);
            if (dataset.owner == user) {
                return true
            };
        };

        // Check if the user has explicit comment permission
        let access_control_exists = exists<research_hub::AccessControl>(resource_id);
        if (!access_control_exists) {
            return false
        };

        let access_control = borrow_global<research_hub::AccessControl>(resource_id);
        if (table::contains(&access_control.permissions, user)) {
            let permission = table::borrow(&access_control.permissions, user);
            return permission.permission_level >= PERMISSION_COMMENT
        };

        false
    }

    public fun has_edit_permission(resource_id: address, user: address): bool {
        // Check if the user is the owner
        let paper_exists = exists<research_hub::Paper>(resource_id);
        let dataset_exists = exists<research_hub::Dataset>(resource_id);

        if (paper_exists) {
            let paper = borrow_global<research_hub::Paper>(resource_id);
            if (paper.owner == user) {
                return true
            };
        } else if (dataset_exists) {
            let dataset = borrow_global<research_hub::Dataset>(resource_id);
            if (dataset.owner == user) {
                return true
            };
        } else {
            return false
        };

        // Check if the user has explicit edit permission
        let access_control_exists = exists<research_hub::AccessControl>(resource_id);
        if (!access_control_exists) {
            return false
        };

        let access_control = borrow_global<research_hub::AccessControl>(resource_id);
        if (table::contains(&access_control.permissions, user)) {
            let permission = table::borrow(&access_control.permissions, user);
            return permission.permission_level >= PERMISSION_EDIT
        };

        false
    }

    // === Helper Functions ===

    public fun is_authorized(seal: &Seal, user: address): bool {
        seal.owner == user || table::contains(&seal.authorized_users, user)
    }

    public fun get_resource_id(seal: &Seal): address {
        seal.resource_id
    }

    public fun get_owner(seal: &Seal): address {
        seal.owner
    }
}
