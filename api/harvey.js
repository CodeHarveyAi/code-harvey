<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Harvey Rewrite Tool</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
    }

    h2 {
      margin-bottom: 30px;
    }

    .container {
      display: flex;
      flex-direction: row;
      gap: 20px;
      justify-content: center;
      margin-bottom: 20px;
    }

    textarea {
      width: 350px;
      height: 200px;
      font-size: 14px;
      padding: 10px;
      resize: none;
    }

    select, button {
      width: 720px;
      font-size: 16px;
      padding: 10px;
      margin: 10px 0;
    }

    button {
      background-color: #0726c3;
      color: white;
      border: none;
      cursor: pointer;
    }

    button:hover {
      background-color: #04188a;
    }
  </style>
</head>
<body>
  <h2>Harvey Rewrite Tool</h2>

  <div class="container">
    <textarea id="inputText" placeholder="Paste up to 500 words here..."></textarea>
    <textarea id="outputText" placeholder="Your rewritten version will appear here..." readonly></textarea>
  </div>

  <select id="toneSelector">
    <option value="standard">Standard</option>
    <option value="academic">Academic</option>
    <option value="professional">Professional</option>
  </select>

  <button onclick="rewriteText()">Rewrite</button>
  <button onclick="copyOutput()">Copy</button>

  <script>
    async function rewriteText() {
      const inputText = document.getElementById('inputText').value;
      const tone = document.getElementById('toneSelector').value;

      const response = await fetch('/api/harvey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, tone })
      });

      const result = await response.json();
      document.getElementById('outputText').value = result.rewrite || 'Error: Could not generate response.';
    }

    function copyOutput() {
      const output = document.getElementById('outputText');
      output.select();
      document.execCommand('copy');
    }
  </script>
</body>
</html>
