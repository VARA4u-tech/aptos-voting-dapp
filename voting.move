module prasad_addr::voting {
    use std::signer;
    use std::vector;
    use std::string;
    use std::table;

    struct Poll has store {  // Changed from 'key' to 'store'
        owner: address,
        options: vector<string::String>,
        votes: table::Table<address, u64>,
        counts: vector<u64>,
    }

    struct PollHolder has key {  // New wrapper struct with 'key' ability
        poll: Poll
    }

    public entry fun create_poll(account: &signer, options: vector<string::String>) {
        let addr = signer::address_of(account);
        let num_options = vector::length(&options);
        let counts = vector::empty<u64>();
        let votes = table::new<address, u64>();
        
        let i = 0;
        while (i < num_options) {
            vector::push_back(&mut counts, 0);
            i = i + 1;
        };

        let poll = Poll {
            owner: addr,
            options,
            votes,
            counts,
        };

        move_to(account, PollHolder { poll });
    }

    public entry fun vote(account: &signer, poll_owner: address, choice: u64) acquires PollHolder {
        let voter_addr = signer::address_of(account);
        let holder = borrow_global_mut<PollHolder>(poll_owner);
        let poll = &mut holder.poll;

        assert!(!table::contains(&poll.votes, voter_addr), 1); // Already voted
        assert!(choice < vector::length(&poll.options), 2);   // Invalid choice

        table::add(&mut poll.votes, voter_addr, choice);
        let count = vector::borrow(&poll.counts, choice);
        *vector::borrow_mut(&mut poll.counts, choice) = *count + 1;
    }

    #[view]
    public fun get_results(poll_owner: address): vector<u64> acquires PollHolder {
        let poll = &borrow_global<PollHolder>(poll_owner).poll;
        poll.counts
    }

    #[view]
    public fun get_options(poll_owner: address): vector<string::String> acquires PollHolder {
        let poll = &borrow_global<PollHolder>(poll_owner).poll;
        poll.options
    }
}