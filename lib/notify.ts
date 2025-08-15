export async function notifySellerApproval(email: string, approved: boolean, notes?: string) {
  console.log(`[NOTIFY] Seller ${approved ? 'APPROVED' : 'REJECTED'} → ${email} ${notes ? `| Notes: ${notes}` : ''}`)
}

export async function notifyProductDecision(sellerEmail: string, productName: string, approved: boolean, notes?: string) {
  console.log(`[NOTIFY] Product ${approved ? 'APPROVED' : 'REJECTED'} → ${sellerEmail} | ${productName} ${notes ? `| Notes: ${notes}` : ''}`)
}


