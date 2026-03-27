# Hackathon Zero-Setup In-Memory Database 
# (This completely removes the need for you to install or run MongoDB locally!)
import asyncio
from bson import ObjectId

class MockCursor:
    def __init__(self, data):
        self.data = data
    async def __aiter__(self):
        for d in self.data: yield d

class MockCollection:
    def __init__(self):
        self.data = []
        
    async def insert_one(self, doc):
        doc["_id"] = ObjectId()
        self.data.append(doc)
        class Res: inserted_id = doc["_id"]
        return Res()
        
    async def find_one(self, query):
        for d in self.data:
            match = True
            for k,v in query.items():
                if d.get(k) != v: match = False
            if match: return d
        return None
        
    async def insert_many(self, docs):
        for d in docs: d["_id"] = ObjectId()
        self.data.extend(docs)
        
    async def update_one(self, query, update):
        if "_id" in query and isinstance(query["_id"], str):
            try: query["_id"] = ObjectId(query["_id"])
            except: pass
        doc = await self.find_one(query)
        if doc and "$set" in update:
            doc.update(update["$set"])
            
    def find(self, query={}):
        filtered = []
        for d in self.data:
            match = True
            for k,v in query.items():
                if d.get(k) != v: match = False
            if match: filtered.append(d)
            
        class QueryBuilder:
            def __init__(self, data): self.data = data
            def sort(self, key, direction):
                self.data.sort(key=lambda x: x.get(key, 0), reverse=(direction == -1))
                return self
            def limit(self, n):
                self.data = self.data[:n]
                return self
            async def __aiter__(self):
                for d in self.data: yield d
        return QueryBuilder(filtered)

class MockDB:
    def __init__(self):
        self.users = MockCollection()
        self.devices = MockCollection()

# Force the MockDB so the application never crashes during a live demo
print("🚀 Launching Zero-Config Database Simulation Engine")
db = MockDB()
