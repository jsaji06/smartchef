# smartChef
![smartChef snapshot](./smartchef-cover.png)

---
smartChef is an AI-powered recipe assistant that generates curated meals based on user-provided ingredients or cooking goals (e.g. "high-protein desserts"), and the user's general cooking expertise.

## 🚀 Features

- **Ingredient-Based Recipe Generation**  
  Enter the ingredients you have and get gourmet-level recipes.

- **Smart Assumptions**  
  Automatically adds required quantities/units to vague inputs or missing items.

- **Experience-Aware Instructions**  
  Cooking steps are adapted for beginner, intermediate, or advanced users.

- **Edit Ingredients Dynamically**  
  Modify or remove assumed ingredients and regenerate recipes accordingly.

- **Nutritional Breakdown**  
  Calories, protein, carbs, and fat per recipe.

- **Modern Stack**  
  Built with **React.js**, **FastAPI**, and **OpenAI's GPT models through LangGraph**.

---

## 🧰 Tech Stack

### Frontend
- Node.js
- React.js
- Font Awesome
- CSS/Flexbox

### Backend
- FastAPI
- Uvicorn

### AI/ML
- LangGraph
- OpenAI API

---

## Setup

### 1. Clone the Repo

```bash
git clone https://github.com/jsaji06/smartchef
cd smartchef
```

### 2. Install packages
```bash
pip install -r requirements.txt
npm install
```

### 3. Set Environment OpenAI API Key*

*I have not officially deployed this application, so in order to utilize this tool, you will need to generate an OpenAI API key of your own. [Click here](https://openai.com/api/) for more information regarding this.

### 4. Run Application
```bash
npm start
```

### 5. Access application on http://localhost:3000
Enjoy!

## Demo Video 
Coming soon!

## Special Notes
1. While, in theory, the installation and setup processes for this application should work, should you get an error that looks like the following:
  ```bash
  Error: Cannot find module '../src/assert'
      Require stack:
      - /Users/USERNAME/Downloads/smartchef-main 2/node_modules/.bin/concurrently
          at Module._resolveFilename (node:internal/modules/cjs/loader:1144:15)
          ...
          at Module._load (node:internal/modules/cjs/loader:1023:12)
          at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:135:12) {
        code: 'MODULE_NOT_FOUND',
        requireStack: [
          '/Users/USERNAME/Downloads/smartchef-main 2/node_modules/.bin/concurrently'
        ]
      }
  ```
Please run the following commands:
  ```bash
  rm -rf node_modules
  rm package-lock.json # or yarn.lock if using yarn
  npm install
  ```
This eliminates the possibility of any corrupt dependencies that can interfere with the application.
