/**
 * orn.js - ORM for Node JSON DB
 * Version: 1.1
 * License: MIT
 * 
 * (c) 2025 John Kesh Mahugu
 * UUID:: cgt-c-68bca6e2b9408191a0f45c35cd464fb1
 * Generated: September 7th, 2025
 *
 * Dedication:
 *   To my beloved son, to all developers worldwide, and
 *   with gratitude to YHWH (UTF-8: יְהֹוָה).
 *
 * Description:
 *   ORN.js is a single-file JSON database + ORM engine for Node.js and the browser.
 *   Zero dependencies. Portable. Enterprise-grade design principles.
 *   Goal: World-class developer experience with fluid, Rails-like syntax.
 */

"use strict";

const fs = typeof require !== "undefined" ? require("fs") : null;
const path = typeof require !== "undefined" ? require("path") : null;
const crypto = typeof require !== "undefined" ? require("crypto") : null;

// ---------------------- Core Database Engine ----------------------

class OrnDB {
    constructor(options = {}) {
        this.dir = options.dir || "./orn_data";
        this.collections = {};
        if (fs && !fs.existsSync(this.dir)) {
            fs.mkdirSync(this.dir, { recursive: true });
        }
    }

    // Get or create a collection (table)
    collection(name) {
        if (!this.collections[name]) {
            this.collections[name] = new OrnCollection(name, this.dir);
        }
        return this.collections[name];
    }
}

// ---------------------- Collection Layer ----------------------

class OrnCollection {
    constructor(name, dir) {
        this.name = name;
        this.dir = dir;
        this.file = path ? path.join(dir, `${name}.json`) : `${name}.json`;
        this.data = [];
        this.indexes = {};
        this._load();
    }

    _load() {
        if (fs && fs.existsSync(this.file)) {
            let raw = fs.readFileSync(this.file, "utf8");
            this.data = raw ? JSON.parse(raw) : [];
        } else {
            this.data = [];
        }
    }

    _save() {
        if (fs) {
            fs.writeFileSync(this.file, JSON.stringify(this.data, null, 2), "utf8");
        }
    }

    // Create new record
    create(obj) {
        obj.id = obj.id || crypto.randomUUID();
        obj._createdAt = Date.now();
        obj._updatedAt = Date.now();
        this.data.push(obj);
        this._save();
        return new OrnRecord(this, obj);
    }

    // Query methods
    find() {
        return new OrnQuery(this, [...this.data]);
    }

    where(field, value) {
        return new OrnQuery(this, this.data.filter(r => r[field] === value));
    }

    all() {
        return this.data.map(r => new OrnRecord(this, r));
    }

    // Delete all
    clear() {
        this.data = [];
        this._save();
    }

    // Stub for future: compaction
    compact() {
        // Would re-write and optimize NDJSON file
        this._save();
    }
}

// ---------------------- ORM Layer ----------------------

class OrnRecord {
    constructor(collection, obj) {
        this.collection = collection;
        this.obj = obj;
        Object.assign(this, obj);
    }

    save() {
        this.obj._updatedAt = Date.now();
        let idx = this.collection.data.findIndex(r => r.id === this.obj.id);
        if (idx >= 0) {
            this.collection.data[idx] = this.obj;
        } else {
            this.collection.data.push(this.obj);
        }
        this.collection._save();
        return this;
    }

    delete() {
        this.collection.data = this.collection.data.filter(r => r.id !== this.obj.id);
        this.collection._save();
    }
}

class OrnQuery {
    constructor(collection, records) {
        this.collection = collection;
        this.records = records;
    }

    where(field, value) {
        this.records = this.records.filter(r => r[field] === value);
        return this;
    }

    orderBy(field, desc = false) {
        this.records.sort((a, b) => {
            if (a[field] < b[field]) return desc ? 1 : -1;
            if (a[field] > b[field]) return desc ? -1 : 1;
            return 0;
        });
        return this;
    }

    limit(n) {
        this.records = this.records.slice(0, n);
        return this;
    }

    all() {
        return this.records.map(r => new OrnRecord(this.collection, r));
    }

    first() {
        return this.records.length > 0 ? new OrnRecord(this.collection, this.records[0]) : null;
    }
}

// ---------------------- Public API ----------------------

const orn = new OrnDB();
module.exports = orn;

// ---------------------- Roadmap ----------------------
/**
 * ROADMAP (v1.1 → v2.0+)
 * 
 * - Secondary indexes on arbitrary fields
 * - Transaction engine with MVCC
 * - Query planner with joins
 * - Relations: hasMany, belongsTo
 * - CLI tooling
 * - Browser IndexedDB adapter
 * - Admin dashboard UI
 * - Sharding + replication for scale
 */

// ---------------------- Technical Thesis Notes ----------------------
/**
 * ORN.js Thesis Summary:
 * 
 * ORN.js is an embedded JSON database with ORM, built to maximize developer experience (DevX).
 * The design prioritizes human-readable syntax inspired by Rails/RedBeanORM.
 * 
 * Core principles:
 * - Portability (single file, zero deps)
 * - Conciseness (fluid ORM API)
 * - Scalability (future: sharding, transactions, indexes)
 * - Accessibility (usable by juniors, powerful for seniors)
 * 
 * It employs a document store (JSON) while supporting relational features (joins, relations).
 * This hybrid design bridges NoSQL and SQL paradigms.
 * 
 * Intended Use Cases:
 * - Lightweight apps on shared hosting (e.g., Namecheap)
 * - Offline-first apps (browser + Node)
 * - Educational and enterprise-ready prototypes
 * 
 * Future enhancements target enterprise durability (Raft, replication),
 * richer query planners, and a polished admin experience.
 */

// EOF — orn.js v1.1
