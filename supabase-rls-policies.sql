-- =====================================================
-- SUPABASE ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- This file contains all the RLS policies for securing your Supabase tables.
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute
-- 4. Then enable RLS on each table by clicking the "RLS disabled" button
--
-- NOTE: Make sure you have a supabase_user_id column in your users table
-- that links to auth.uid(). If not, you may need to adjust the policies.
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Allow authenticated users to insert their own profile (signup)
CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (email = auth.jwt()->>'email');

-- =====================================================
-- BUSINESSES TABLE POLICIES
-- =====================================================

-- Users can view their own business
CREATE POLICY "Users can view own business"
ON businesses FOR SELECT
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can insert their own business
CREATE POLICY "Users can insert own business"
ON businesses FOR INSERT
WITH CHECK (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can update their own business
CREATE POLICY "Users can update own business"
ON businesses FOR UPDATE
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can delete their own business
CREATE POLICY "Users can delete own business"
ON businesses FOR DELETE
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- =====================================================
-- INGREDIENTS TABLE POLICIES
-- =====================================================

-- Users can view their own ingredients
CREATE POLICY "Users can view own ingredients"
ON ingredients FOR SELECT
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can insert their own ingredients
CREATE POLICY "Users can insert own ingredients"
ON ingredients FOR INSERT
WITH CHECK (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can update their own ingredients
CREATE POLICY "Users can update own ingredients"
ON ingredients FOR UPDATE
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can delete their own ingredients
CREATE POLICY "Users can delete own ingredients"
ON ingredients FOR DELETE
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- =====================================================
-- RECIPES TABLE POLICIES
-- =====================================================

-- Users can view their own recipes
CREATE POLICY "Users can view own recipes"
ON recipes FOR SELECT
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can insert their own recipes
CREATE POLICY "Users can insert own recipes"
ON recipes FOR INSERT
WITH CHECK (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can update their own recipes
CREATE POLICY "Users can update own recipes"
ON recipes FOR UPDATE
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can delete their own recipes
CREATE POLICY "Users can delete own recipes"
ON recipes FOR DELETE
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- =====================================================
-- RECIPE_INGREDIENTS TABLE POLICIES
-- =====================================================

-- Users can view recipe ingredients for their own recipes
CREATE POLICY "Users can view own recipe ingredients"
ON recipe_ingredients FOR SELECT
USING (recipe_id IN (
  SELECT id FROM recipes WHERE user_id IN (
    SELECT id FROM users WHERE email = auth.jwt()->>'email'
  )
));

-- Users can insert recipe ingredients for their own recipes
CREATE POLICY "Users can insert own recipe ingredients"
ON recipe_ingredients FOR INSERT
WITH CHECK (recipe_id IN (
  SELECT id FROM recipes WHERE user_id IN (
    SELECT id FROM users WHERE email = auth.jwt()->>'email'
  )
));

-- Users can update recipe ingredients for their own recipes
CREATE POLICY "Users can update own recipe ingredients"
ON recipe_ingredients FOR UPDATE
USING (recipe_id IN (
  SELECT id FROM recipes WHERE user_id IN (
    SELECT id FROM users WHERE email = auth.jwt()->>'email'
  )
));

-- Users can delete recipe ingredients for their own recipes
CREATE POLICY "Users can delete own recipe ingredients"
ON recipe_ingredients FOR DELETE
USING (recipe_id IN (
  SELECT id FROM recipes WHERE user_id IN (
    SELECT id FROM users WHERE email = auth.jwt()->>'email'
  )
));

-- =====================================================
-- SALES TABLE POLICIES
-- =====================================================

-- Users can view their own sales
CREATE POLICY "Users can view own sales"
ON sales FOR SELECT
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can insert their own sales
CREATE POLICY "Users can insert own sales"
ON sales FOR INSERT
WITH CHECK (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can update their own sales
CREATE POLICY "Users can update own sales"
ON sales FOR UPDATE
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can delete their own sales
CREATE POLICY "Users can delete own sales"
ON sales FOR DELETE
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- =====================================================
-- EXPENSES TABLE POLICIES
-- =====================================================

-- Users can view their own expenses
CREATE POLICY "Users can view own expenses"
ON expenses FOR SELECT
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can insert their own expenses
CREATE POLICY "Users can insert own expenses"
ON expenses FOR INSERT
WITH CHECK (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can update their own expenses
CREATE POLICY "Users can update own expenses"
ON expenses FOR UPDATE
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- Users can delete their own expenses
CREATE POLICY "Users can delete own expenses"
ON expenses FOR DELETE
USING (user_id IN (
  SELECT id FROM users WHERE email = auth.jwt()->>'email'
));

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the policies are working:

-- Check if RLS is enabled on all tables
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public';

-- List all policies
-- SELECT tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public';
