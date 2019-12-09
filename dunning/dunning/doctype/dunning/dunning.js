// Copyright (c) 2019, Alyf and contributors
// For license information, please see license.txt

frappe.ui.form.on('Dunning', {
	setup: function (frm) {
		frm.set_query('sales_invoice', () => {
			return {
				"filters": {
					"docstatus": 1,
					"company": frm.doc.company,
					"outstanding_amount": [">", 0],
					"status": "Overdue"
				},
			};
		});
	},
	refresh: function (frm) {
		frm.set_df_property("company", "read_only", frm.doc.__islocal ? 0 : 1);
		frm.toggle_display("naming_series", false);
		if (frm.is_new()) {
			frm.trigger("calculate_overdue_days");
			frm.set_value("posting_date", frappe.datetime.nowdate());
		}
	},
  	company: function(frm) {
		if (frm.doc.company == 'SC ESO Electronic S.R.L') {
			frm.set_value('naming_series', 'PR-RO-.YY.-.#####');
		}
		else {
			frm.set_value('naming_series', 'PR-DE-.YY.-.#####');
		}
  	},
	dunning_type: function(frm) {
	    frm.trigger("get_text_block");
	},
	language: function(frm) {
		frm.trigger("get_text_block");
	},
	get_text_block: function (frm) {
		if(frm.doc.dunning_type && frm.doc.language) {
		    frappe.call({
		      method: "dunning.dunning.doctype.dunning.dunning.get_text_block",
		      args: {
				  dunning_type: frm.doc.dunning_type,
				  language: frm.doc.language,
				  doc: frm.doc
		      },
		      callback: function(r) {
				  if (r.message) {
					  frm.set_value("top_text_block", r.message.top_text_block);
					  frm.set_value("bottom_text_block", r.message.bottom_text_block);
				  }
				  else {
					  frm.set_value("top_text_block", '');
					  frm.set_value("bottom_text_block", '');
				  }
		      }
		    });
		}
	},
	due_date: function (frm) {
		frm.trigger("calculate_overdue_days");
	},
	posting_date: function (frm) {
		frm.trigger("calculate_overdue_days");
	},
	interest_rate: function (frm) {
		frm.trigger("calculate_interest");
	},
	outstanding_amount: function (frm) {
		frm.trigger("calculate_sum");
	},
	interest_amount: function (frm) {
		frm.trigger("calculate_sum");
	},
	dunning_fee: function (frm) {
		frm.trigger("calculate_sum");
	},
	sales_invoice: function (frm) {
		frm.trigger("calculate_overdue_days");
	},
	calculate_overdue_days: function (frm) {
		if (frm.doc.posting_date && frm.doc.due_date) {
			const posting_date = frm.get_field("posting_date").get_value();
			const due_date = frm.get_field("due_date").get_value();

			const overdue_days = moment(posting_date).diff(due_date, "days");
			frm.set_value("overdue_days", overdue_days);
		}
	},
	calculate_sum: function (frm) {
		const outstanding_amount = frm.get_field("outstanding_amount").get_value() || 0;
		const interest_amount = frm.get_field("interest_amount").get_value() || 0;
		const dunning_fee = frm.get_field("dunning_fee").get_value() || 0;

		const sum = outstanding_amount + interest_amount + dunning_fee;
		frm.set_value("sum", sum);
	},
	calculate_interest: function (frm) {
		const interest_rate = frm.get_field("interest_rate").get_value() || 0;
		const outstanding_amount = frm.get_field("outstanding_amount").get_value() || 0;
		const overdue_days = frm.get_field("overdue_days").get_value() || 0;

		const interest_per_year = outstanding_amount * interest_rate / 100;
		const interest_amount = interest_per_year / 360 * overdue_days;
		frm.set_value("interest_amount", interest_amount);
	}
});
