// Copyright (c) 2019, Alyf and contributors
// For license information, please see license.txt

frappe.ui.form.on("Dunning", {
  setup: function(frm) {
    frm.set_query("sales_invoice", () => {
      return {
        filters: {
          docstatus: 1,
          company: frm.doc.company,
          outstanding_amount: [">", 0]
        }
      };
    });
  },
  refresh: function(frm) {
    frm.set_df_property("company", "read_only", frm.doc.__islocal ? 0 : 1);
    frm.toggle_display("naming_series", false);
    if (frm.is_new()) {
      if (frm.doc.sales_invoice) {
        frm.trigger("calculate_overdue_days");
      }
      frm.set_value("posting_date", frappe.datetime.nowdate());
    }
  },
  company: function(frm) {
    if (frm.doc.company == "SC ESO Electronic S.R.L") {
      frm.set_value("naming_series", "PR-RO-.YY.-.#####");
    } else {
      frm.set_value("naming_series", "PR-DE-.YY.-.#####");
    }
  },
  sales_invoice: function(frm) {
    if (frm.doc.sales_invoice) {
      frm.trigger("calculate_overdue_days");
    } else {
      frm.trigger("clear_calculated_fields");
    }
  },
  due_date: function(frm) {
    frm.trigger("calculate_overdue_days");
  },
  posting_date: function(frm) {
    frm.trigger("calculate_overdue_days");
  },
  interest_rate: function(frm) {
    frm.trigger("calculate_interest");
  },
  outstanding_amount: function(frm) {
    frm.trigger("calculate_sum");
  },
  interest_amount: function(frm) {
    frm.trigger("calculate_sum");
  },
  dunning_fee: function(frm) {
    frm.trigger("calculate_sum");
  },
  calculate_overdue_days: function(frm) {
    if (frm.doc.sales_invoice) {
      const posting_date = frm.get_field("posting_date").get_value();
      const due_date = frm.get_field("due_date").get_value();

      const overdue_days = moment(posting_date).diff(due_date, "days");
      frm.set_value("overdue_days", overdue_days);
    } else {
      frm.trigger("clear_calculated_fields");
    }
  },
  calculate_sum: function(frm) {
    if (frm.doc.sales_invoice) {
      const outstanding_amount =
        frm.get_field("outstanding_amount").get_value() || 0;
      const interest_amount = frm.get_field("interest_amount").get_value() || 0;
      const dunning_fee = frm.get_field("dunning_fee").get_value() || 0;

      const sum = outstanding_amount + interest_amount + dunning_fee;
      frm.set_value("sum", sum);
    } else {
      frm.trigger("clear_calculated_fields");
    }
  },
  calculate_interest: function(frm) {
    if (frm.doc.sales_invoice) {
      const interest_rate = frm.get_field("interest_rate").get_value() || 0;
      const outstanding_amount =
        frm.get_field("outstanding_amount").get_value() || 0;
      const overdue_days = frm.get_field("overdue_days").get_value() || 0;

      const interest_per_year = (outstanding_amount * interest_rate) / 100;
      const interest_amount = (interest_per_year / 360) * overdue_days;
      frm.set_value("interest_amount", interest_amount);
    } else {
      frm.trigger("clear_calculated_fields");
    }
  },
  clear_calculated_fields: function(frm) {
    frm.set_value("overdue_days", null);
    frm.set_value("due_date", null);
    frm.set_value("outstanding_amount", 0);
    frm.set_value("interest_amount", 0);
    frm.set_value("sum", 0);
  }
});
