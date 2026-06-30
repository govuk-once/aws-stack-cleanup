export const emailBody =
  '<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Stack Cleanup Report</title></head><body style="fonr-family:Arial, sans-serif;"><h1>AWS Stack Cleanup Report @date@</h1>@report@</body></html>';

export const emailAccountSection =
  '<h2>@accountName@ @accountNumber@</h2><h3>Stacks marked as do not delete</h3>@doNotDeleteReport@<h3>Stacks marked for deletion</h3>@deleteReport@';
export const emailTableBody =
  '<table border="1" cellpadding="6" cellspacing="0" stype border-collapse: collapse; width: 100%;><thead><tr><th align="left">Stack Name</th><th align="left">Last Up Dated</th><th align="left">Stack Status</th></tr></thead><tbody>@rows@</tbody></table>';
export const emailTableRow =
  '<tr><td>@stackName@</td><td>@lastUpDated@</td><td>@stackStatus@</td></tr>';
