
```markdown
# 🤖 Visual AI Decision Flow Builder

An interactive, visual AI workflow automation system where each canvas node represents an AI decision step returning either **YES** or **NO**. Built with **React Flow** for frontend node editing and **Inngest** for resilient asynchronous backend execution powered by **OpenAI**.

---

## 🚀 Features

* **Interactive Flow Canvas:** Drag-and-drop node placement, dynamic branching connection (YES/NO edges), and custom prompt configurations via `@xyflow/react`.
* **Inngest Step Execution Engine:** Reliability-focused backend engine handling step-by-step traversal, node state persistence, and automatic retries.
* **Deterministic AI Evaluation:** Leverages OpenAI (`gpt-4o-mini`) configured for binary YES/NO decision outputs.
* **Execution Logs Panel:** Real-time log inspection panel for viewing step outputs and node decision histories.
* **JSON Import/Export:** Save canvas workflow structures locally or import pre-configured decision trees.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 14+ (App Router), React, Tailwind CSS, Lucide Icons
* **Workflow Canvas:** React Flow (`@xyflow/react`)
* **Execution Engine:** Inngest SDK
* **AI Provider:** OpenAI API (`gpt-4o-mini`)
* **Language:** TypeScript

---

## 📦 Getting Started

### 1. Clone the Repository
```bash
git clone [https://github.com/yzkielr/AI-Workflow-System.git](https://github.com/yzkielr/AI-Workflow-System.git)
cd ai-workflow-builder

```

### 2. Install Dependencies

```bash
npm install

```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
INNGEST_EVENT_KEY=local-dev-key

```

### 4. Run Development Servers

Open two terminal windows:

* **Terminal 1 (Next.js Application):**
```bash
npm run dev

```


* **Terminal 2 (Inngest Dev Server):**
```bash
npx inngest-cli@latest dev

```



Visit `http://localhost:3000` to open the application and `http://localhost:8288` to view the Inngest Dashboard.

---

## 🔄 How It Works

1. **Build the Graph:** Create decision nodes on the canvas and define prompt conditions (e.g., *"Is this a technical support request?"*).
2. **Connect Branches:** Draw green connections from the **YES** handle or red connections from the **NO** handle to target nodes.
3. **Trigger Workflow:** Input a test payload and click **Run Workflow**.
4. **Execution Loop:** Inngest triggers the `workflow/run` event, evaluates each prompt via OpenAI sequentially, and follows the corresponding YES/NO edge until the workflow finishes.

```

```