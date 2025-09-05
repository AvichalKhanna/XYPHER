import json
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader

# ✅ Step 1: Load the new polite_1000_intents.json
with open(r"Backend\polite_1000_intents.json", "r", encoding="utf-8") as f:
    raw_data = json.load(f)

# ✅ Step 2: Convert to InputExamples
examples = []
for item in raw_data:
    query = item["query"]
    responses = item["response"]  # list of multiple responses
    for resp in responses:
        examples.append(InputExample(texts=[query, resp]))

# ✅ Step 3: Initialize the model
model = SentenceTransformer("all-MiniLM-L6-v2")  # ⚡ fast & accurate

# ✅ Step 4: Setup training
train_dataloader = DataLoader(examples, shuffle=True, batch_size=8)
train_loss = losses.MultipleNegativesRankingLoss(model)

# ✅ Step 5: Fine-tune
model.fit(
    train_objectives=[(train_dataloader, train_loss)],
    epochs=4,
    warmup_steps=10,
    show_progress_bar=True
)

# ✅ Step 6: Save model
model.save("fast_semantic_bot_polite")
print("Model saved to fast_semantic_bot_polite")
