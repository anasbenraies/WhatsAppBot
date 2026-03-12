```md
# Tunisian Dialect AI Chatbot — Production Ready Example

This document describes a **production-ready architecture** for building a **short-response AI chatbot that understands Tunisian dialect** for a **very specific domain**.

The system is optimized for:

- Very short conversations (1–1.5 sentences)
- Highly specific topic/domain
- Fast responses
- Low cost
- Easy maintainability

The stack used in this example:

- Next.js (API routes)
- Node.js
- Supabase (vector database)
- Gemini API (LLM + embeddings)

---

# 1. System Architecture

Message processing flow:

```

User message
↓
Normalization (dialect cleaning)
↓
Embedding generation
↓
Vector similarity search
↓
Context retrieval
↓
LLM generates short answer
↓
Response returned to user

```

This architecture is called **RAG (Retrieval Augmented Generation)**.

Advantages:

- No heavy fine-tuning needed
- Very accurate for domain-specific tasks
- Cheap to operate
- Easy to extend

---

# 2. Project Structure

Example production-ready structure:

```

ai-chatbot/
│
├── app/
│   └── api/
│        └── chat/
│            └── route.ts
│
├── lib/
│   ├── ai.ts
│   ├── embedding.ts
│   ├── vectorSearch.ts
│   ├── normalize.ts
│   └── supabase.ts
│
├── data/
│   └── dataset.json
│
├── scripts/
│   └── ingest.ts
│
├── supabase/
│   └── schema.sql
│
├── types/
│   └── chatbot.ts
│
├── .env
└── package.json

````

---

# 3. Knowledge Dataset

Small dataset of questions and answers.

`data/dataset.json`

```json
[
 {
  "question": "chnoua hal service",
  "answer": "service ysa3dek tetaba3 application mte3ek"
 },
 {
  "question": "kifeh nesta3mlou",
  "answer": "tsajel w tabda tetaba3 el application"
 },
 {
  "question": "fama notification",
  "answer": "ey fama notification ki yetbadel status"
 }
]
````

Important: add **dialect variations**

Example:

```
chnoua
chnowa
chneya
```

This improves matching accuracy.

---

# 4. Supabase Vector Database

Create a table for storing knowledge and embeddings.

`supabase/schema.sql`

```sql
create table chatbot_knowledge (
 id uuid primary key default uuid_generate_v4(),
 question text,
 answer text,
 embedding vector(768)
);
```

Create vector index:

```sql
create index on chatbot_knowledge
using ivfflat (embedding vector_cosine_ops);
```

---

# 5. Embedding Service

Responsible for converting text to vectors.

`lib/embedding.ts`

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function createEmbedding(text: string) {

 const model = genAI.getGenerativeModel({
   model: "text-embedding-004"
 });

 const result = await model.embedContent(text);

 return result.embedding.values;

}
```

---

# 6. Dialect Normalization

Tunisian dialect has many spelling variations.

Normalization improves search accuracy.

`lib/normalize.ts`

```ts
export function normalize(text: string) {

 return text
   .toLowerCase()
   .replace("chnowa","chnoua")
   .replace("chneya","chnoua")
   .replace("kifh","kifeh")
   .trim();

}
```

---

# 7. Vector Search

Search the database for the closest matching questions.

`lib/vectorSearch.ts`

```ts
import { supabase } from "./supabase";

export async function searchKnowledge(embedding:number[]) {

 const { data } = await supabase.rpc("match_documents", {
   query_embedding: embedding,
   match_count: 3
 });

 return data;

}
```

Supabase RPC function:

```sql
create function match_documents(
 query_embedding vector,
 match_count int
)
returns table (
 id uuid,
 question text,
 answer text,
 similarity float
)
language sql stable
as $$
 select
   id,
   question,
   answer,
   1 - (embedding <=> query_embedding) as similarity
 from chatbot_knowledge
 order by embedding <=> query_embedding
 limit match_count;
$$;
```

---

# 8. LLM Response Generator

The LLM uses retrieved knowledge to generate the final answer.

`lib/ai.ts`

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateReply(context:string, question:string){

 const model = genAI.getGenerativeModel({
   model: "gemini-1.5-flash"
 });

 const prompt = `
You are a chatbot that answers in Tunisian dialect.

Rules:
- answer in Tunisian dialect
- very short answers
- max 1 sentence

Context:
${context}

User question:
${question}
`;

 const result = await model.generateContent(prompt);

 return result.response.text();

}
```

---

# 9. Next.js API Route

Handles incoming chat messages.

`app/api/chat/route.ts`

```ts
import { createEmbedding } from "@/lib/embedding";
import { searchKnowledge } from "@/lib/vectorSearch";
import { generateReply } from "@/lib/ai";
import { normalize } from "@/lib/normalize";

export async function POST(req:Request){

 const { message } = await req.json();

 const normalized = normalize(message);

 const embedding = await createEmbedding(normalized);

 const knowledge = await searchKnowledge(embedding);

 const context = knowledge
  .map((k:any)=>`Q:${k.question} A:${k.answer}`)
  .join("\n");

 const reply = await generateReply(context, message);

 return Response.json({
  reply
 });

}
```

---

# 10. Frontend Request Example

```ts
const res = await fetch("/api/chat",{
 method:"POST",
 headers:{
  "Content-Type":"application/json"
 },
 body:JSON.stringify({
  message:"chnoua hal service"
 })
})

const data = await res.json()

console.log(data.reply)
```

---

# 11. Dataset Ingestion Script

This script converts dataset questions to embeddings and inserts them into Supabase.

`scripts/ingest.ts`

```ts
import dataset from "../data/dataset.json";
import { createEmbedding } from "../lib/embedding";

for(const item of dataset){

 const embedding = await createEmbedding(item.question);

 await supabase.from("chatbot_knowledge").insert({
   question:item.question,
   answer:item.answer,
   embedding
 });

}
```

Run:

```
node scripts/ingest.ts
```

---

# 12. Example Conversation

User message:

```
chnowa hal service
```

Normalization:

```
chnoua hal service
```

Vector search result:

```
service ysa3dek tetaba3 application
```

Final AI answer:

```
service y3awnek tetaba3 application mte3ek
```

---

# 13. Performance

Typical performance:

```
dataset size: 50–200 questions
latency: ~300ms
cost: extremely low
accuracy: very high
```

Because the domain is very specific.

---

# 14. Production Improvements

Recommended additions:

### Caching

Use Redis to cache frequent questions.

### Intent Classification

Example intents:

```
service_info
usage_question
notification_question
```

### Logging

Store all conversations to improve dataset over time.

---

# 15. Real-World Architecture

Similar architecture used by:

* Intercom AI
* Zendesk AI
* Drift chatbot

Typical system:

```
RAG
+
Domain dataset
+
LLM refinement
```

---

# Conclusion

This architecture allows building a **high-quality Tunisian dialect AI chatbot** with:

* only **30–200 training examples**
* **very low cost**
* **high accuracy**
* **fast responses**

It is ideal for **micro-SaaS AI assistants** or **customer support bots** in niche domains.

```
```
