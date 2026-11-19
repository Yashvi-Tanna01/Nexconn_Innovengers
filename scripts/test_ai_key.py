import urllib.request
import json

api_key = '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'
headers = {
    'Authorization': f'Bearer {api_key}',
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://antah.network',
    'X-Title': 'ANTAH Civic Intelligence'
}

models_to_test = [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'mistralai/mistral-small-24b-instruct-2501:free',
    'deepseek/deepseek-r1:free',
    'meta-llama/llama-3.1-8b-instruct:free',
    'openrouter/auto'
]

working_models = []
for m in models_to_test:
    data = {
        'model': m,
        'messages': [{'role': 'user', 'content': 'Say ANTAH AI ONLINE in 3 words.'}]
    }
    req = urllib.request.Request('https://openrouter.ai/api/v1/chat/completions', data=json.dumps(data).encode(), headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=12) as res:
            reply = json.loads(res.read().decode())['choices'][0]['message']['content'].strip()
            print(f'[SUCCESS] Model {m} works! Reply: {reply}')
            working_models.append(m)
    except Exception as e:
        err_msg = ''
        if hasattr(e, 'read'):
            err_msg = e.read().decode()[:150]
        print(f'[FAILED] Model {m}: {e} -> {err_msg}')

print('Working models:', working_models)
