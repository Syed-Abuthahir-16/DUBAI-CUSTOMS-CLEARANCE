# Dubai Customs Declaration Assistant - Start Guide

An AI-powered web application that automates the conversion of shipping invoice and packing list PDFs into structured drafts matching Dubai Customs (Mirsal 2 / Dubai Trade) fields.

---

## 🚀 Setup & Installation Instructions (For Any Mac)

### Prerequisites
Make sure **Node.js** (v18 or higher) is installed on the computer. You can download it from [nodejs.org](https://nodejs.org/).

### 1. Extract & Open Project
Open your Terminal, navigate to this project folder:
```bash
cd "dubai-customs-declaration"
```

### 2. Install Dependencies
Run the install command to download all required modules:
```bash
npm install
```

### 3. Start the Development Server
Start the local server. The project has been configured to serve on port **8080**:
```bash
npm run dev
```
Once started, open your web browser and go to:
👉 **[http://localhost:8080](http://localhost:8080)**

### 4. Build for Production
To bundle the project for hosting (e.g. Vercel, Netlify):
```bash
npm run build
```

---

## ⚙️ Configuration (.env)

The `.env` file in the root directory contains the configurations. If you move this project to another Mac, make sure the `.env` file is present.

*   **OpenAI API Key:** The `OPENAI_API_KEY` is loaded securely. The application uses OpenAI's `gpt-4o-mini` model.
*   **Database (Supabase):** Currently runs in a standalone **localStorage mock fallback mode** because no Supabase URL is active. This allows you to immediately upload PDFs, view extractions, edit forms, edit spreadsheet grids, and download bulk files without setting up a backend!
    *   To connect a live Supabase DB, change `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` to your actual Supabase project keys.

---

## 📄 How to Test the Demo PDF

We have included a realistic 8-page shipping dossier PDF containing mock customs details:
*   **File Name:** `demo_customs_pack_v2.pdf`
*   **Location:** Located directly in the root of this project folder.
*   **How to test:** 
    1. Open the app at [http://localhost:8080](http://localhost:8080).
    2. Drag and drop the `demo_customs_pack_v2.pdf` file into the upload area.
    3. The application will simulate AI parsing and open the workspace split editor.
    4. View the PDF on the left panel, and review/edit the extracted metadata and spreadsheet on the right.
    5. Test copying individual inputs (click the hover clipboard icon inside any text box) or download a bulk import template (CSV/XML).
