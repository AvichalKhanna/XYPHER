import json

examples = []

# Read from intents.json
with open("intents.json", "r") as f:
    data = json.load(f)

for intent in data["intents"]:
    patterns = intent["patterns"]
    responses = intent["responses"]
    try:
        for pattern in patterns:  # ✅ You missed this loop
            for response in responses:
                if (len(response) > 1) and len(pattern) > 1:
                    print(f"Appending {pattern} _______________> {response}")
                    examples.append({"query": pattern, "response": response})
    except: pass
print(f"{len(examples)} training samples generated")

# Optional: save this new dataset
with open("fine_tune_data.json", "w") as f:
    json.dump(examples, f, indent=4)