import frappe

def execute():
	dunnings = frappe.get_all("Dunning")
	for dunning in dunnings:
		dunning_doc = frappe.get_doc("Dunning", dunning.name)
		customer_name = frappe.get_value("Sales Invoice", dunning_doc.sales_invoice, "customer_name")
		dunning_doc.db_set('customer_name', customer_name)
	print("Customer Names updated successfully successfully")