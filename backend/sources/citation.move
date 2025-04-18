module research_hub::citation {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};
    use std::vector;
    use research_hub::research_hub::{Self, Paper};

    // Error codes
    const ENotAuthorized: u64 = 0;
    const ECitationNotFound: u64 = 1;
    const ESelfCitationNotAllowed: u64 = 2;

    // Citation record
    struct Citation has key, store {
        id: UID,
        paper_id: address,
        cited_paper_id: address,
        citation_text: String,
        page_number: Option<u64>,
        created_at: u64,
    }

    // Citation counter for a paper
    struct CitationCounter has key, store {
        id: UID,
        paper_id: address,
        citation_count: u64,
        citations: Table<address, bool>, // Set of papers that cite this paper
    }

    // Events
    struct CitationAddedEvent has copy, drop {
        citation_id: address,
        paper_id: address,
        cited_paper_id: address,
        created_at: u64,
    }

    struct CitationRemovedEvent has copy, drop {
        citation_id: address,
        paper_id: address,
        cited_paper_id: address,
    }

    // === Citation Management ===

    public entry fun add_citation(
        paper: &Paper,
        cited_paper_id: address,
        citation_text: String,
        page_number: Option<u64>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let paper_id = object::uid_to_address(&paper.id);
        
        // Verify that the sender is the owner of the paper
        assert!(research_hub::is_paper_owner(paper, sender), ENotAuthorized);
        
        // Prevent self-citation
        assert!(paper_id != cited_paper_id, ESelfCitationNotAllowed);
        
        let timestamp = tx_context::epoch(ctx);
        
        // Create citation record
        let citation_id = object::new(ctx);
        let citation_address = object::uid_to_address(&citation_id);
        
        let citation = Citation {
            id: citation_id,
            paper_id,
            cited_paper_id,
            citation_text,
            page_number,
            created_at: timestamp,
        };
        
        // Update or create citation counter for the cited paper
        update_citation_counter(cited_paper_id, paper_id, ctx);
        
        // Emit event
        event::emit(CitationAddedEvent {
            citation_id: citation_address,
            paper_id,
            cited_paper_id,
            created_at: timestamp,
        });
        
        // Transfer citation to the paper owner
        transfer::transfer(citation, sender);
    }

    public entry fun remove_citation(
        citation: Citation,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let paper_id = citation.paper_id;
        let cited_paper_id = citation.cited_paper_id;
        let citation_id = object::uid_to_address(&citation.id);
        
        // Verify that the sender is the owner of the citation
        // This is implicitly checked by Move's ownership system
        
        // Emit event
        event::emit(CitationRemovedEvent {
            citation_id,
            paper_id,
            cited_paper_id,
        });
        
        // Decrease citation count for the cited paper
        decrease_citation_counter(cited_paper_id, paper_id, ctx);
        
        // Delete the citation
        let Citation { id, paper_id: _, cited_paper_id: _, citation_text: _, page_number: _, created_at: _ } = citation;
        object::delete(id);
    }

    // === Helper Functions ===

    fun update_citation_counter(
        cited_paper_id: address,
        citing_paper_id: address,
        ctx: &mut TxContext
    ) {
        // Try to find existing counter
        let counter_exists = research_hub::citation_counter_exists(cited_paper_id);
        
        if (counter_exists) {
            // Update existing counter
            let counter = research_hub::borrow_mut_citation_counter(cited_paper_id, ctx);
            
            if (!table::contains(&counter.citations, citing_paper_id)) {
                table::add(&mut counter.citations, citing_paper_id, true);
                counter.citation_count = counter.citation_count + 1;
            };
        } else {
            // Create new counter
            let counter_id = object::new(ctx);
            let mut citations = table::new<address, bool>(ctx);
            table::add(&mut citations, citing_paper_id, true);
            
            let counter = CitationCounter {
                id: counter_id,
                paper_id: cited_paper_id,
                citation_count: 1,
                citations,
            };
            
            // Transfer to shared object
            transfer::share_object(counter);
        };
    }

    fun decrease_citation_counter(
        cited_paper_id: address,
        citing_paper_id: address,
        ctx: &mut TxContext
    ) {
        // Try to find existing counter
        let counter_exists = research_hub::citation_counter_exists(cited_paper_id);
        
        if (counter_exists) {
            // Update existing counter
            let counter = research_hub::borrow_mut_citation_counter(cited_paper_id, ctx);
            
            if (table::contains(&counter.citations, citing_paper_id)) {
                table::remove(&mut counter.citations, citing_paper_id);
                counter.citation_count = counter.citation_count - 1;
            };
        };
    }

    // === Public Accessors ===

    public fun get_citation_details(citation: &Citation): (address, address, String, Option<u64>, u64) {
        (
            citation.paper_id,
            citation.cited_paper_id,
            citation.citation_text,
            citation.page_number,
            citation.created_at
        )
    }

    public fun get_citation_count(counter: &CitationCounter): u64 {
        counter.citation_count
    }

    public fun is_cited_by(counter: &CitationCounter, paper_id: address): bool {
        table::contains(&counter.citations, paper_id)
    }
}
