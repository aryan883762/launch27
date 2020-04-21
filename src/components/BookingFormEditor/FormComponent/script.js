const componentsDefinitions = require('@/components/BookingFormEditor/definitions/core-components.js').default;
const cfComponentsDefinitions = require('@/components/BookingFormEditor/definitions/custom-field-components.js').default;

import formComponentTemplatesComponents from '@/components/BookingFormEditor/FormComponentTemplates';

export default {
    name: 'booking-form-component',
    components: Object.assign(
        {
            'component-styler': require('@/components/BookingFormEditor/ComponentStyler/component.vue').default,
            'custom-fields-menu': require('@/components/BookingFormEditor/CustomFieldsMenu/component.vue').default,
        },
        formComponentTemplatesComponents,
    ),
    props: {
        item: Object,
        template: Object,
        layout: Object,
        overrides: Object,
        editorMode: {
            type: Boolean,
            default: true,
        },
        childIndex: Number,
        parent: Object,
        customFieldsLayout: Object,
    },
    data() {
        return {
            isHighlighted: false,
            isSelected: false,
            currentItem: {},
            itemMenu: {
                activeTab: 'content',
            },
            sortable: {
                isDragging: false,
                list: [],
            },
            customFieldMenuState: {},
            settings: {},
            affixOptions: {},
        }
    },
    created() {
        this.settings = this.layout.components[this.item.id];

        this.$events.on('BookingFormEditor:activeComponentChanged', (id) => {
            this.isSelected = (id == this.item.id && this.editorMode);
        });
        this.$events.on('BookingFormEditor:highlightedComponentChanged', (id) => {
            this.isHighlighted = (id == this.item.id && this.editorMode);
        });

        this.currentItem = JSON.parse(JSON.stringify(this.settings));
        if (!this.currentItem.hasOwnProperty('styles')) {
            this.$set(this.currentItem, 'styles', {});
        }
        if (!this.currentItem.hasOwnProperty('attributes')) {
            this.$set(this.currentItem, 'attributes', {});
        }

        if (!this.overrides.components.hasOwnProperty(this.item.id)) {
            this.$set(this.overrides.components, this.item.id, {attributes: {}, styles: {}});
        }

        this.currentItem = Object.assign(this.currentItem, this.overrides.components[this.item.id]);
        this.settings.attributes = Object.assign({}, this.settings.attributes || {}, this.overrides.components[this.item.id].attributes);

        // inject custom field layout
        if (this.layout.cfLayout && this.layout.cfLayout.hasOwnProperty(this.item.id)) {
            this.$set(this.item, 'children', this.layout.cfLayout[this.item.id].children);
        }

        if (this.editorMode) {
            this.$store.state.bookingFormEditor.availableSlots = [
                {
                    "day":this.$$moment().format('YYYY-MM-DD'),
                    "opened":true,
                    "slots":[
                        {"time":"8:00","datetime":"2019-11-14T08:00:00.000Z","arrival_window":0,"teams_available":false,"spots_available":2},
                        {"time":"10:00","datetime":"2019-11-14T10:00:00.000Z","arrival_window":0,"teams_available":false,"spots_available":2},
                        {"time":"12:00","datetime":"2019-11-14T12:00:00.000Z","arrival_window":0,"teams_available":false,"spots_available":2},
                        {"time":"14:00","datetime":"2019-11-14T14:00:00.000Z","arrival_window":0,"teams_available":false,"spots_available":2},
                        {"time":"16:00","datetime":"2019-11-14T16:00:00.000Z","arrival_window":0,"teams_available":false,"spots_available":2}
                    ]
                }
            ]
        }
    },
    mounted() {
        if (this.currentItem.sortable) {
            this.sortable.list = this.item.children.map(item => item.id);
        }

        if (!this.editorMode) {
            if (this.currentItem.fieldId == 'booking-summary-wrapper') {
                this.affixOptions = {
                    scrollable: window,
                    el: this.$el,
                };

                setTimeout(() => {
                    this.affixInit();
                }, 1000);

                window.addEventListener('resize', this.affixInit, false);
            }
        }
    },
    computed: {
        blockName() {
            return componentsDefinitions[this.settings.type].name;
        },
        currentItemAttributes() {
            var out = this.settings.attributes;
            return out;
        },
        styles() {
            var out = {};

            var layoutDefault = this.layout.styles && this.layout.styles.default ? this.layout.styles.default : {};
            var templateDefault = this.template.styles && this.template.styles.default ? this.template.styles.default : {};
            var defaultStyles = this.template.styles && this.template.styles[this.settings.type] ? this.template.styles[this.settings.type] : {};
            var componentStyles = this.template.styles && this.template.styles.components && this.template.styles.components[this.item.id] ? this.template.styles.components[this.item.id] : {};
            var overridesGeneralStyles = this.overrides.styles && this.overrides.styles.default ? this.overrides.styles.default : {};
            var overridesDefaultStyles = this.overrides.styles && this.overrides.styles[this.settings.type] ? this.overrides.styles[this.settings.type] : {};
            var customStyles = this.settings.styles || {};
            out = Object.assign({}, layoutDefault, templateDefault, defaultStyles, customStyles, componentStyles, overridesGeneralStyles, overridesDefaultStyles, this.currentItem.styles);

            if (out.hasOwnProperty('fontId') && !out.hasOwnProperty('fontFamily')) {
                var font = this.fonts.find(obj => obj.id == out.fontId);
                if (font && font.id) {
                    out.fontFamily = font['font-family'];
                }
            }
            
            if ((out.hasOwnProperty('borderWidth') || out.hasOwnProperty('borderColor')) && !out.hasOwnProperty('borderStyle')) {
                out.borderStyle = 'solid';
            }
            return out;
        },
        processedStyles() {
            var out = Object.assign({}, this.styles);
            out = this.normalizeStyles(out);
            return out;
        },
        fonts() {
            var fonts = [];
            var fontsList = require('@/components/BookingFormEditor/fonts.json');
            fontsList.sort(function(a,b) {
                return b.name.toLowerCase() < a.name.toLowerCase();
            });

            if (fontsList.length) {
                fonts = fontsList;
            }
            return fonts;
        },
        itemLabelStyles() {
            var out = {};
            var styles = Object.assign({}, this.template.styles.label || {}, this.overrides.styles.label || {});
            if (Object.keys(styles)) {
                out = this.normalizeStyles(styles);
            }
            return out;
        },
        wrapperStyles() {
            var out = {};
            if (this.settings.type == 'column') {
                out['width'] = this.settings.width || '50%';
            }
            if (this.settings.type == 'container') {
                out = this.processedStyles;
            }
            if (this.settings.type == 'customFields') {
                if (this.currentItemAttributes.hidden) {
                    out.backgroundImage = `url(${ require('@/assets/booking-form/custom-fields-bg.png') })`;
                }
            }
            return out;
        },
        wrapperClasses() {
            var out = [];
            out.push('component-type--' + this.currentItem.type);
            if (this.currentItem.hasOwnProperty('class') && this.item.hasOwnProperty('children')) {
                out.push(this.currentItem.class);
            }
            if (this.isSelected) out.push('selected');
            if (this.isHighlighted) out.push('highlighted');
            out.push('booking-form-component--' + this.item.id);
            if (this.hasErrors) {
                out.push('has-errors');
            }
            if (this.currentItemAttributes.hidden == true) {
                out.push('is-hidden');
            }
            if (this.currentItem.type == 'row') {
                if (this.currentItem.responsiveChildren !== false) {
                    out.push('responsive-children');
                }
            }
            return out;
        },
        itemClasses() {
            var out = [];
            if (this.currentItem.hasOwnProperty('class') && !this.item.hasOwnProperty('children')) {
                out.push(this.currentItem.class);
            }
            return out;
        },
        typeSettings() {
            return componentsDefinitions[this.currentItem.type];
        },
        styleables() {
            var out = [];
            if (this.typeSettings.hasOwnProperty('styleables')) {
                out = this.typeSettings.styleables;
            }
            return out;
        },
        componentVisibility() {
            if (this.currentItemAttributes.hidden && !this.editorMode) {
                return false;
            }

            if (this.currentItem.formId == 'service_category') {
                if (!this.$store.state.bookingFormEditor.company.serviceCategories || this.$store.state.bookingFormEditor.company.serviceCategories.filter(item => item.active).length <= 1) {
                    return false;
                }
            }

            if (!this.editorMode) {
                if (this.currentItemAttributes.conditionalLogic && this.currentItemAttributes.conditionalLogicAction && this.currentItemAttributes.conditionalLogicConditions && this.currentItemAttributes.conditionalLogicConditions.length) {
                    return this.checkConditionalLogic();
                }

                if (this.currentItem.hasOwnProperty('dependsOn') && this.currentItem.dependsOn.length) {
                    for(var i = 0; i < this.currentItem.dependsOn; i++) {
                        var depComponent = this.layout.components[this.currentItem.dependsOn[i]];
                        if (depComponent) {
                            var depValue = this.form[depComponent.formId];
                            if (depValue == 'undefined' || depValue == null || !depValue.length) {
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        },
        form() {
            return this.$store.state.bookingFormEditor.form;
        },
        hasErrors() {
            return this.$store.state.bookingFormEditor.formValidation.hasOwnProperty(this.item.id) && this.$store.state.bookingFormEditor.formValidation[this.item.id].length;
        },
        errors() {
            var out = [];
            if (this.hasErrors) {
                out = this.$store.state.bookingFormEditor.formValidation[this.item.id];
            }
            return out;
        },
        displayErrors() {
            var out = null;
            if (this.errors.length) {
                out = this.errors.join('. ');
            }
            return out;
        },
        draggable() {
            return this.parentItem.sortable;
        },
        deletable() {
            return this.childIndex !== undefined && this.parent.children && this.currentItem.deletable;
        },
        componentToLoad() {
            var name = 'booking-form-editor-form-component-template-' + (this.settings.type.toLowerCase());
            var out = (formComponentTemplatesComponents.hasOwnProperty(name)) ? name : null;
            return out;
        },
        sortedChildren() {
            var items = this.item.children;
            items.sort((a, b) => {
                var itemA = this.overrides.components[a.id];
                var itemB = this.overrides.components[b.id];
                if (itemA && itemB) {
                    if (itemA.order < itemB.order) return -1;
                    if (itemA.order > itemB.order) return 1;
                }
                return 0;
            });
            return items;
        },
        parentItem() {
            var out = {};
            if (this.parent && this.parent.id) {
                var overrides = this.overrides.components[this.parent.id] || {};
                var layout = this.layout.components[this.parent.id] || {};
                out = Object.assign(layout, overrides);
            }
            return out;
        },
        isLoading() {
            if (this.currentItem.fieldId == 'pricing-summary') {
                return this.$helpers.isLoading('bookingForm:pricing');
            }
        }
    },
    methods: {
        onHover() {
            this.$events.emitEvent('BookingFormEditor:highlightedComponentChanged', [this.item.id]);
        },
        onHoverOff() {
            this.$events.emitEvent('BookingFormEditor:highlightedComponentChanged', [null]);
        },
        onClick() {
            this.$events.emitEvent('BookingFormEditor:activeComponentChanged', [this.item.id]);
            this.$events.emitEvent('BookingFormEditor:editComponent', [{id: this.item.id, settings: this.settings, styles: this.overrides.components[this.item.id].styles, styleables: this.styleables}]);
        },
        deleteComponent() {
            this.$events.emitEvent('BookingFormEditor:activeComponentChanged', [null]);
            var index = this.parent.children.findIndex(obj => obj.id == this.item.id);
            if (index !== -1) {
                this.$delete(this.parent.children, index);
                if (this.currentItem.customField === true && this.currentItem.parentId) {
                    this.$delete(this.layout.components, this.item.id);
                    this.$events.emitEvent('BookingFormEditor:customFieldDeleted', [{id: this.item.id, item: this.currentItem}]);
                }
            }
        },
        insertCustomField(type) {
            var items = [];
            if (cfComponentsDefinitions.hasOwnProperty(type)) {
                if (cfComponentsDefinitions[type].hasOwnProperty('component')) {
                    items = this.createCustomFieldComponent(cfComponentsDefinitions[type].component, this.item.id);
                }
            }

            if (items.length) {
                var layout = {};
                items.forEach((item) => {
                    var itemId = item.id;
                    this.$set(this.layout.components, itemId, item);
                    this.$events.emitEvent('BookingFormEditor:customFieldInserted', [{id: itemId, item: item}]);

                    if (item.parentId == this.item.id) {
                        layout.id = item.id;
                    }

                    var children = items.filter(obj => obj.parentId == itemId);
                    if (children.length) {
                        layout.children = [];
                        children.forEach(child => {
                            layout.children.push({id: child.id});
                        });
                        item.droppable = true;
                    }
                    delete item.id;
                });
                
                if (!this.item.hasOwnProperty('children')) {
                    this.$set(this.item, 'children', []);
                }
                this.item.children.push(layout);

                this.$events.emitEvent('BookingFormEditor:customFieldLayoutUpdated', [this.customFieldsLayout || this.item]);
            }

            this.customFieldMenuState[this.item.id] = false;
        },
        createCustomFieldComponent(component, parentId, stack) {
            var stack = stack || [];
            component = JSON.parse(JSON.stringify(component));
            var item = component;
            item.parentId = parentId;
            item.customField = true;
            item.deletable = true;
            item.hidable = true;
            item.id = this.generateCustomFieldId();
            if (['textfield', 'select', 'checkbox', 'radio', 'textarea'].indexOf(item.type) !== -1) {
                item.formId = item.id;
            }
            if (!item.hasOwnProperty('attributes')) {
                item.attributes = {};
            }
            stack.push(item);

            if (component.children) {
                component.children.forEach((child) => {
                    this.createCustomFieldComponent(child, item.id, stack);
                });
                delete component.children;
            }

            return stack;
        },
        generateCustomFieldId() {
            var out = null;
            while(out == null) {
                var rand = Math.floor(Math.random() * 10000) + 1;
                var tmpId = 'cf' + rand;
                if (!this.layout.components.hasOwnProperty(tmpId)) {
                    out = tmpId;
                }
            }
            return out;
        },
        enableCustomFields() {
            if (!this.overrides.components.hasOwnProperty(this.item.id)) {
                this.$set(this.overrides.components, this.item.id, {attributes: {}, styles: {}});
            }
            if (!this.overrides.components[this.item.id].hasOwnProperty('attributes')) {
                this.$set(this.overrides.components[this.item.id], 'attributes', {});
            }
            this.overrides.components[this.item.id].attributes.hidden = false;
            this.settings.attributes.hidden = false;
        },
        onCustomFieldMenuItemSelect(item) {
            this.insertCustomField(item);
        },
        checkConditionalLogic() {
            var out = false, passed, fails = 0;
            this.currentItemAttributes.conditionalLogicConditions.forEach(condition => {
                var result = this.checkConditionalLogicRule(condition);
                if (result !== true) {
                    fails++
                }
            });

            passed = fails === 0;

            if (this.currentItemAttributes.conditionalLogicAction == 'show') {
                out = passed;
            }
            else if (this.currentItemAttributes.conditionalLogicAction == 'hide') {
                out = !passed;
            }

            return out;
        },
        checkConditionalLogicRule(condition) {
            var out = false;
            var fieldId = condition.field;
            var op = condition.operator;
            var val = condition.value.toLowerCase();
            if (fieldId && op && val) {
                if (this.layout.components[fieldId]) {
                    var formId = this.layout.components[fieldId].formId;
                    if (formId && this.form.hasOwnProperty(formId)) {
                        var fieldVal = this.form[formId].toLowerCase();
                        if (op == 'is') {
                            out = fieldVal == val;
                        }
                        else if (op == 'not') {
                            out = fieldVal != val;
                        }
                        else if (op == 'gt') {
                            out = fieldVal > val;
                        }
                        else if (op == 'lt') {
                            out = fieldVal < val;
                        }
                        else if (op == 'contains') {
                            out = fieldVal.indexOf(val) !== -1;
                        }
                        else if (op == 'starts_with') {
                            out = fieldVal.indexOf(val) === 0;
                        }
                        else if (op == 'ends_with') {
                            out = fieldVal.indexOf(val) === (fieldVal.length - val.length);
                        }
                    }
                }
            }
            else {
                out = true;
            }
            return out;
        },
        normalizeStyles(styles) {
            var out = styles || {};

            if (out.hasOwnProperty('paddingTop') && out.paddingTop) out.paddingTop = out.paddingTop + 'px';
            if (out.hasOwnProperty('paddingBottom') && out.paddingBottom) out.paddingBottom = out.paddingBottom + 'px';
            if (out.hasOwnProperty('paddingLeft') && out.paddingLeft) out.paddingLeft = out.paddingLeft + 'px';
            if (out.hasOwnProperty('paddingRight') && out.paddingRight) out.paddingRight = out.paddingRight + 'px';

            if (out.hasOwnProperty('marginTop') && out.marginTop) out.marginTop = out.marginTop + 'px';
            if (out.hasOwnProperty('marginBottom') && out.marginBottom) out.marginBottom = out.marginBottom + 'px';
            if (out.hasOwnProperty('marginLeft') && out.marginLeft) out.marginLeft = out.marginLeft + 'px';
            if (out.hasOwnProperty('marginRight') && out.marginRight) out.marginRight = out.marginRight + 'px';

            if (out.hasOwnProperty('height') && out.height) out.height = out.height + 'px';
            if (out.hasOwnProperty('borderWidth') && out.borderWidth) out.borderWidth = out.borderWidth + 'px';
            if (out.hasOwnProperty('borderRadius') && out.borderRadius) out.borderRadius = out.borderRadius + 'px';
            if (out.hasOwnProperty('fontSize') && out.fontSize) out.fontSize = out.fontSize + 'px';

            return out;
        },
        onSortableEnd(added, removed, moved) {
            this.sortable.list.forEach((id, index) => {
                if (!this.overrides.components.hasOwnProperty(id)) {
                    this.$set(this.overrides.components, id, {});
                }
                this.$set(this.overrides.components[id], 'order', index);
            });
        },
        getSortableItemKey(item) {
            var key = item.id;
            if (this.overrides.components.hasOwnProperty(item.id)) {
                key += '-' + (this.overrides.components[item.id].order || '');
            }
            return key;
        },
        affixInit() {
            if (window.innerWidth > 767) {
                var elRect = this.affixOptions.el.getBoundingClientRect();
                this.affixOptions.elTop = window.pageYOffset + elRect.top;
                if (this.affixOptions.el) {
                    this.affixOptions.elWidth = this.affixOptions.el.getBoundingClientRect().width;
                    if (elRect.top < 0) {
                        this.affixApply();
                    }
                    this.affixOptions.scrollable.addEventListener('scroll', this.affixOnScroll, false);
                }
            }
            else {
                if (this.affixOptions.el) {
                    this.affixOptions.scrollable.removeEventListener('scroll', this.affixOnScroll, false);
                    this.affixReset();
                }
            }
        },
        affixOnScroll() {
            var scrollTop = this.affixOptions.scrollable.pageYOffset !== undefined ? this.affixOptions.scrollable.pageYOffset : this.affixOptions.scrollable.scrollTop;
            if (scrollTop > this.affixOptions.elTop) {
                this.affixApply();
            }
            else {
                this.affixReset();
            }
        },
        affixApply() {
            this.affixOptions.el.style.top = '0';
            this.affixOptions.el.style.position = 'fixed';
            this.affixOptions.el.style.width = this.affixOptions.elWidth + 'px';
        },
        affixReset() {
            this.affixOptions.el.style.top = 'initial';
            this.affixOptions.el.style.position = 'relative';
            this.affixOptions.el.style.width = 'auto';
        }
    }
}