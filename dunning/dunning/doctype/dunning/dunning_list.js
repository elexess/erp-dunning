frappe.listview_settings['Dunning'] = {
	add_fields: ["resolution_status"],
	get_indicator: function (doc) {
		if (doc.resolution_status === "Resolved") {
			return [__("Resolved"), "green", "resolution_status,=,Resolved"];
		}
		else {
			return [__("Unresolved"), "yellow", "resolution_status,=,Unresolved"];
		}
	}
}