#!/usr/bin/env python3
"""
Create target account structure reference for Eagle accounts
"""

import pandas as pd
import json

def create_eagle_account_reference():
    print("📊 Creating Eagle Account Structure Reference...")
    
    # Load Eagle accounts
    eagle_df = pd.read_csv('test-data/bny-eagle-ledger-accounts.csv')
    
    # Create structured reference
    eagle_accounts = []
    account_classes = {}
    
    for _, row in eagle_df.iterrows():
        account = {
            "account_code": str(row['GL_Account']),
            "description": str(row['GL_Description']),
            "account_class": str(row['Account_Class']),
            "sub_class": str(row['Sub_Class']),
            "financial_statement": str(row['Financial_Statement']),
            "normal_balance": str(row['Normal_Balance']),
            "status": str(row['Status']),
            "department": str(row['Department']),
            "cost_center": str(row['Cost_Center'])
        }
        eagle_accounts.append(account)
        
        # Group by account class
        class_name = account['account_class']
        if class_name not in account_classes:
            account_classes[class_name] = {
                "sub_classes": {},
                "accounts": []
            }
        
        account_classes[class_name]["accounts"].append(account)
        
        # Group by sub class
        sub_class = account['sub_class']
        if sub_class not in account_classes[class_name]["sub_classes"]:
            account_classes[class_name]["sub_classes"][sub_class] = []
        
        account_classes[class_name]["sub_classes"][sub_class].append(account)
    
    # Create comprehensive reference structure
    eagle_reference = {
        "system_name": "BNY Eagle",
        "total_accounts": len(eagle_accounts),
        "account_structure": {
            "code_format": "6-digit numeric (e.g., 101000)",
            "hierarchy": "Account Class > Sub Class > Individual Accounts",
            "departments": list(set(acc["department"] for acc in eagle_accounts)),
            "cost_centers": list(set(acc["cost_center"] for acc in eagle_accounts))
        },
        "account_classes": account_classes,
        "all_accounts": eagle_accounts
    }
    
    # Save to JSON file
    with open('eagle_account_reference.json', 'w') as f:
        json.dump(eagle_reference, f, indent=2)
    
    print(f"✅ Created Eagle reference with {len(eagle_accounts)} accounts")
    print(f"📋 Account Classes: {list(account_classes.keys())}")
    print(f"💾 Saved to: eagle_account_reference.json")
    
    return eagle_reference

if __name__ == "__main__":
    create_eagle_account_reference()