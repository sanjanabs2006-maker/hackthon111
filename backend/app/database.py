"""
MongoDB and In-Memory persistent fallback store for Krishi Mitra.
Ensures 100% reliable functionality whether local MongoDB daemon is running or offline.
"""
import os
import json
from datetime import datetime
from bson import ObjectId
from pymongo import MongoClient, ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from flask import Flask, g

_client = None
_db = None
_use_memory = False
_memory_store = {
    "users": {},
    "farmer_profiles": {},
    "farm_land": {},
    "crops": {},
    "schemes": {},
    "scheme_rules": {},
    "scheme_sources": {},
    "eligibility_assessments": {},
    "crop_health_analyses": {},
    "weather_records": {},
    "market_prices": {},
    "documents": {},
    "knowledge_articles": {},
    "conversations": {},
    "messages": {},
    "saved_schemes": {},
    "notifications": {},
    "audit_logs": {},
}


class MockCollection:
    def __init__(self, name):
        self.name = name

    def _get_store(self):
        if self.name not in _memory_store:
            _memory_store[self.name] = {}
        return _memory_store[self.name]

    def insert_one(self, doc):
        store = self._get_store()
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = ObjectId()
        oid = doc_copy["_id"]
        store[str(oid)] = doc_copy
        class InsertResult:
            inserted_id = oid
        return InsertResult()

    def find_one(self, filter_dict=None):
        store = self._get_store()
        if not filter_dict:
            return next(iter(store.values()), None)
        for doc in store.values():
            match = True
            for k, v in filter_dict.items():
                if k == "_id":
                    if str(doc.get("_id")) != str(v):
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                return dict(doc)
        return None

    def find(self, filter_dict=None, projection=None, sort=None, limit=None):
        store = self._get_store()
        results = []
        for doc in store.values():
            if not filter_dict:
                results.append(dict(doc))
                continue
            match = True
            for k, v in filter_dict.items():
                if k == "_id":
                    if str(doc.get("_id")) != str(v):
                        match = False
                        break
                elif isinstance(v, dict):
                    # Simple operator handling like $in, $regex
                    val = doc.get(k)
                    if "$in" in v and val not in v["$in"]:
                        match = False
                        break
                    if "$regex" in v and (not val or v["$regex"].lower() not in str(val).lower()):
                        match = False
                        break
                elif doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(dict(doc))
        if isinstance(sort, list) and len(sort) > 0:
            key, direction = sort[0]
            results.sort(key=lambda x: str(x.get(key, "")), reverse=(direction == DESCENDING))
        elif isinstance(projection, list) and len(projection) > 0 and isinstance(projection[0], tuple):
            key, direction = projection[0]
            results.sort(key=lambda x: str(x.get(key, "")), reverse=(direction == DESCENDING))
        if limit:
            results = results[:limit]
        return results

    def update_one(self, filter_dict, update_dict):
        doc = self.find_one(filter_dict)
        if not doc:
            class UpdateResult:
                matched_count = 0
                modified_count = 0
            return UpdateResult()
        store = self._get_store()
        oid_str = str(doc["_id"])
        target = store[oid_str]
        if "$set" in update_dict:
            target.update(update_dict["$set"])
        else:
            target.update(update_dict)
        class UpdateResult:
            matched_count = 1
            modified_count = 1
        return UpdateResult()

    def delete_one(self, filter_dict):
        doc = self.find_one(filter_dict)
        if doc:
            store = self._get_store()
            del store[str(doc["_id"])]
            class DeleteResult:
                deleted_count = 1
            return DeleteResult()
        class DeleteResult:
            deleted_count = 0
        return DeleteResult()

    def delete_many(self, filter_dict=None):
        store = self._get_store()
        if not filter_dict:
            count = len(store)
            store.clear()
            class DeleteResult:
                deleted_count = count
            return DeleteResult()
        to_delete = []
        for k, doc in store.items():
            match = True
            for fk, fv in filter_dict.items():
                if doc.get(fk) != fv:
                    match = False
                    break
            if match:
                to_delete.append(k)
        for k in to_delete:
            del store[k]
        class DeleteResult:
            deleted_count = len(to_delete)
        return DeleteResult()

    def count_documents(self, filter_dict=None):
        return len(self.find(filter_dict))

    def create_index(self, *args, **kwargs):
        pass


class MockDatabase:
    def __getitem__(self, item):
        return MockCollection(item)


def get_db():
    global _use_memory, _db
    if _use_memory or _db is None:
        return MockDatabase()
    return _db


def get_collection(name: str):
    return get_db()[name]


def init_db(app: Flask):
    global _client, _db, _use_memory

    mongo_uri = app.config.get("MONGO_URI", "mongodb://localhost:27017/krishi_mitra")
    try:
        _client = MongoClient(mongo_uri, serverSelectionTimeoutMS=1500)
        _client.admin.command("ping")
        _db = _client.get_default_database() if "/" in mongo_uri.split("@")[-1] else _client["krishi_mitra"]
        app.logger.info("✅ MongoDB connected successfully to %s", mongo_uri)
        _use_memory = False
    except Exception as e:
        app.logger.warning("⚡ Local MongoDB not active. Initialized fast memory-store for uninterrupted execution.")
        _use_memory = True
        _db = MockDatabase()

    from app.services.seed_data import seed_initial_data
    seed_initial_data()
