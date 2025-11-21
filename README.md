# SkinWise

## Description
SkinWise is an intelligent skincare companion that empowers users to build personalized skincare routines. Leveraging AI-powered analysis and a comprehensive ingredient database, SkinWise helps users understand their skin's unique needs, discover compatible ingredients, and track their skincare journey with confidence.

Whether you're dealing with acne, aging, dryness, or sensitivity, SkinWise creates tailored morning and evening routines that adapt to your skin type, concerns, and goals. The platform combines advanced ingredient compatibility checking with AI-driven routine analysis to ensure your skincare products work together effectively and safely.

This project or part of this project was developed as part of the SD Capstone course at GGC under Dr. B.

---

## Features

### **Personalized Skin Assessment**
Complete an interactive skin quiz to create your unique profile. The assessment captures your skin type, primary concerns, goals, allergies, ingredient preferences, and lifestyle factors to build a comprehensive understanding of your skin's needs.

### **Personalized Routine Generation**
Generate custom morning and evening skincare routines tailored to your unique profile. The system matches products from curated databases based on your skin type, concerns, goals, allergies, and budget preferences. Each routine step includes multiple product recommendations, usage frequency, and detailed application notes.

### **AI-Powered Routine Analysis**
Analyze your current skincare routine using Google Gemini AI to identify ingredient conflicts, potential irritations, and best practices violations. Receive a comprehensive compatibility report with severity ratings, affected products, and personalized recommendations for optimization.

### **Skincare Diary**
Track your daily skincare journey with a comprehensive diary. Log your routine usage, skin observations, and progress over time. View weekly summaries and identify patterns in your skin's response to products.

### **Product Discovery**
Browse curated skincare products from major retailers. Search and filter products by brand, category, price range, and ingredients to find products that match your routine recommendations.

### **Ingredient Database**
Explore an extensive database of skincare ingredients with detailed information.

### **Ingredient Compatibility Chart**
Visualize ingredient interactions in your routine. The compatibility checker identifies potential conflicts, safe pairings, and optimal ingredient combinations to maximize your skincare results.

### **Educational Hub**
Access science-backed skincare education, tips, and guidance to deepen your understanding of skincare ingredients, routines, and best practices.

---

## Technologies Used

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI/ML**: Google Gemini API
---

## Repo Location
🔗 [https://github.com/mvazquezguzman/skincare-project](https://github.com/mvazquezguzman/skincare-project)

---

## Installation Steps 📋

1. **Clone the repository**
   ```bash
   git clone https://github.com/mvazquezguzman/skincare-project.git
   cd skincare-project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Google Gemini API (for routine analysis and generation)
   GOOGLE_GEMINI_API_KEY=your_gemini_api_key
   GEMINI_MODEL=gemini-2.5-flash  # Optional, defaults to gemini-2.5-flash

   # RapidAPI (for Sephora product data)
   RAPIDAPI_KEY=your_rapidapi_key  # Optional, only needed for product syncing
   ```

4. **Set up Supabase database**
   
   Run the SQL scripts in the `supabase/` directory to set up your database schema:
   - `users.sql`
   - `user_routines.sql`
   - `user_routine_analyses.sql`
   - `user_diary_entries.sql`
   - `sephora_products.sql` (optional)
   - `ulta_products.sql` (optional)

---

## How to Run 🚀

1. **Development mode**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

2. **Production build**
   ```bash
   npm run build
   npm start
   ```

3. **Additional scripts**
   ```bash
   # Lint code
   npm run lint

   # Sync Sephora products (requires RAPIDAPI_KEY)
   npm run sync-sephora-products

   # Test API connection
   npm run test-api-direct

   # Check database connection
   npm run check-db
   ```

---

## License
📄 SkinWise © 2025 by Matilda Vazquez-Guzman. This project is licensed under the [MIT License](https://opensource.org/license/MIT).
See the [LICENSE](https://github.com/mvazquezguzman/skincare-project/blob/main/documents/LICENSE.md) file for details.