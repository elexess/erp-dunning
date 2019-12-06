# -*- coding: utf-8 -*-
# Copyright (c) 2019, Alyf and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import json
from six import string_types

class Dunning(Document):
	pass

@frappe.whitelist()
def get_text_block(dunning_type, language, doc):	
	"""
		This allows the rendering of parsed fields in the jinja template
	"""
	if isinstance(doc, string_types):
		doc = json.loads(doc)

	text_block = frappe.db.get_value('Dunning Type Text Block', {'parent': dunning_type, 'language': language}, 'text_block')

	if text_block:
		return frappe.render_template(text_block, doc)