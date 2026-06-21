-- CRITICAL: Enable RLS on ALL tables (prevents users from seeing each other's data)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_payments ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/write their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Income sources
CREATE POLICY "Users own income sources" ON public.income_sources
  FOR ALL USING (auth.uid() = user_id);

-- Expenses
CREATE POLICY "Users own expenses" ON public.expenses
  FOR ALL USING (auth.uid() = user_id);

-- Debts
CREATE POLICY "Users own debts" ON public.debts
  FOR ALL USING (auth.uid() = user_id);

-- Debt payments
CREATE POLICY "Users own debt payments" ON public.debt_payments
  FOR ALL USING (auth.uid() = user_id);

-- Savings goals
CREATE POLICY "Users own savings goals" ON public.savings_goals
  FOR ALL USING (auth.uid() = user_id);

-- Savings contributions
CREATE POLICY "Users own savings contributions" ON public.savings_contributions
  FOR ALL USING (auth.uid() = user_id);

-- Recurring payments
CREATE POLICY "Users own recurring payments" ON public.recurring_payments
  FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
