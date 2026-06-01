import pandas as pd

# Paths
BASE_DIR = r"F:\Projects\Python\Freelance.Analytics.Statistics_011\data-analysis-with-python-an-spss-model"
python_csv = f"{BASE_DIR}\\cleaned_credit_matrix.csv"
spss_csv = f"{BASE_DIR}\\scored_credit_underwriting.csv"
output_csv = f"{BASE_DIR}\\final_credit_risk_matrix.csv"

print("[INFO] Loading Python SASRA engine output...")
df_py = pd.read_csv(python_csv)

print("[INFO] Loading SPSS underwriting scorecard output...")
df_spss = pd.read_csv(spss_csv)

# Try to align on Member_Registration_No
# Adjust column names here if they differ slightly between files
left_key = "Member_ID"              # from Python pipeline
right_key = "Member_Registration_No"  # from SPSS export

print(f"[INFO] Merging on {left_key} <-> {right_key} ...")
df_merged = df_py.merge(
    df_spss,
    left_on=left_key,
    right_on=right_key,
    how="left",
    suffixes=("_SASRA", "_UNDERWRITING")
)

print(f"[INFO] Records after merge: {len(df_merged):,}")

print(f"[INFO] Writing unified matrix to: {output_csv}")
df_merged.to_csv(output_csv, index=False)

print("[SUCCESS] final_credit_risk_matrix.csv generated successfully.")
