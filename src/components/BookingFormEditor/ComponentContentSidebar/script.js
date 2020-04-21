const componentsDefinitions = require('@/components/BookingFormEditor/definitions/core-components.js').default;

export default {
    name: 'booking-form-component-content-sidebar',
    props: {
        item: {
            type: Object,
            required: true,
        },
        layout: {
            type: Object,
            required: true,
        }
    },
    data() {
        return {
            activeSection: 'general',
            conditionalLogicStatus: false,
        }
    },
    created() {
        if (!this.item.settings.hasOwnProperty('attributes')) {
            this.item.settings.attributes = {};
        }

        if (this.mustHaveAttributes.length) {
            this.mustHaveAttributes.forEach((attr) => {
                if (!this.item.settings.attributes.hasOwnProperty(attr)) {
                    var val = ['options'].indexOf(attr) !== -1 ? [] : null;
                    this.$set(this.item.settings.attributes, attr, val);
                }
            });
        }
    },
    computed: {
        attributes() {
            return this.item.settings.attributes;
        },
        isHidable() {
            var out = false;
            if (this.item.settings.hidable && (!this.item.settings.required && (this.layout.components[this.item.id] && !this.layout.components[this.item.id].required))) {
                out = true;
            }
            return out;
        },
        mustHaveAttributes() {
            var out = [];
            var type = this.item.settings.type;
            var typeDef = componentsDefinitions[type];
            if (typeDef && typeDef.attributes && typeDef.attributes.length) {
                out = typeDef.attributes;
            }
            return out;
        },
        isCoreFormComponent() {
            return !this.isCustomFormComponent;
        },
        isCustomFormComponent() {
            return this.item.settings.customField === true;
        },
        isInputField() {
            return this.item.settings.hasOwnProperty('formId');
        },
        isConditionalLogicAllowed() {
            return this.$can('manage', 'plan_conditional_booking_form')
                    && (this.isCustomFormComponent
                        // || (!this.i tem.settings.required && ['textfield', 'textarea', 'text', 'select', 'checkbox', 'radio', 'button', 'image', 'datePicker', 'timePicker'].indexOf(this.item.settings.type) !== -1)
                    );
        },
        visibilityConditions() {
            var out = [];

            return out;
        },
        conditionalLogicFields() {
            var out = [];
            for(var id in this.layout.components) {
                var item = this.layout.components[id];
                if (item.hasOwnProperty('formId') && id != this.item.id && ['textfield', 'textarea', 'select', 'checkbox', 'radio'].indexOf(item.type) !== -1) {
                    var tmp = {};
                    tmp.id = id;
                    tmp.label = item.displayName;
                    tmp.label = (!tmp.label && item.attributes) ? item.attributes.placeholder : tmp.label;
                    tmp.label = (!tmp.label && item.attributes) ? item.attributes.label : tmp.label;
                    tmp.label = (!tmp.label && item.formId) ? item.formId.replace('_', '') : tmp.label;
                    out.push(tmp);
                }
            }

            //sort
            out.sort(function (a, b) {
                var aName = a.label.toLowerCase();
                var bName = b.label.toLowerCase();
                if (aName < bName) return -1;
                if (aName > bName) return 1;
                return 0;
            });

            return out;
        }
    },
    methods: {
        addSelectOption() {
            this.attributes.options.push({value: null, label: null});
        },
        deleteSelectOptionByIndex(index) {
            this.$confirm('This option will be deleted permanently. Continue?', 'Warning', {
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                this.$delete(this.attributes.options, index);
            }).catch();
        },
        checkHasAttributes(attributes) {
            var out = attributes && attributes.length ? true : false;
            attributes.forEach((attr) => {
                if (this.mustHaveAttributes.indexOf(attr) === -1) {
                    out = false;
                }
            });
            return out;
        },
        toggleConditionalLogicState() {
            if (this.attributes.conditionalLogic === true) {
                if (!this.attributes.hasOwnProperty('conditionalLogicAction')) {
                    this.$set(this.attributes, 'conditionalLogicAction', 'show');
                }
            }
        },
        addConditionalLogicCondition() {
            if (!this.attributes.hasOwnProperty('conditionalLogicConditions')) {
                this.$set(this.attributes, 'conditionalLogicConditions', []);
            }
            this.attributes.conditionalLogicConditions.push({field: '', operator: 'is', value: ''});
        },
        deleteConditionalLoginConditionByIndex(index) {
            this.$confirm('This condition will be deleted permanently. Continue?', 'Warning', {
                confirmButtonText: 'Delete',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(() => {
                this.$delete(this.attributes.conditionalLogicConditions, index);
            }).catch();
        },
    },
}