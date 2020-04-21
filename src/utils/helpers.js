import $events from './events';
import {root_app} from '@/main.js';
import {Message} from 'element-ui'

export default {
    splitNames: (name) => {
        let fullName = name.split(' ')
        return {
            firstName: fullName[0],
            lastName: () => {
                fullName.splice(fullName[0], 1)
                return fullName.join(' ')
            }
        }
    },
    errorHandle: (err, instance) => {


        if (err.response && err.response.data && err.response.data.error.op) {
            //this is a mongo level error
            if (err.response.data.error.code === 11000) {
                if (err.response.data.error.op.name) {
                    if (instance.$route.name === 'dashboard_settings_services_categories')
                        Message.error("Category name already exits", {showClose: true, duration: 1000})
                    else if (instance.$route.name === 'dashboard_settings_services_pricing')
                        Message.error("Variable name already exits", {showClose: true, duration: 1000})
                    else if (instance.$route.name === 'dashboard_settings_services_add')
                        Message.error("Service name already exits", {showClose: true, duration: 1000})
                    else
                        Message.error(err.response.data.error.op.name + " is not unique", {
                            showClose: true,
                            duration: 1000
                        })
                } else {
                    Message.error("Name cannot be duplicated", {showClose: true, duration: 1000})
                }
                return;
            }
        }


        if (err.response && err.response.data && err.response.data.error.details && err.response.data.error.details.messages) {
            //let str = "<strong>" + err.response.data.error.name + "</strong> <br\>
            let str = ""
            for (let x in err.response.data.error.details.messages) {
                str += "<label style='padding: 5px 0px;display:block;'>" + x + " " + err.response.data.error.details.messages[x][0] + "</label>"
            }

            return Message({
                dangerouslyUseHTMLString: true,
                message: str,
                type: 'error',
                duration: 1000,
                showClose: true
            });

        }

        if (err.response && err.response.data) {
            return Message.error(err.response.data.error.message, {showClose: true, duration: 1000})
        }

        if (typeof err === 'string') {
            return Message.error(err, {showClose: true, duration: 1000})
        }

        if (err && err.message) {
            return Message.error(err.message, {showClose: true, duration: 1000})
        }

        return Message.error('Unknown error has occurred')


    },
    successHandle: (msg, instance) => {
        Message({
            message: `${msg}`,
            type: 'success',
            duration: 1000,
            showClose: true
        })
    },
    loadedJs: [],
    loadJs(url, id) {
        var existing = id ? document.getElementById(id) : null;
        if (!existing) {
            var s, r, t;
            r = false;
            s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = url;
            if (id) s.id = id;
            var _this = this;
            s.onload = s.onreadystatechange = function () {
                if (!r && (!this.readyState || this.readyState == 'complete')) {
                    r = true;
                    $events.emitEvent('js-loaded', [id]);
                }
            };
            t = document.getElementsByTagName('script')[0];
            t.parentNode.insertBefore(s, t);
            this.loadedJs.push(id);
        } else if (existing !== null) {
            $events.emitEvent('js-loaded', [id]);
        }
    },
    loadedCss: [],
    loadCss(url, id) {
        var existing = id ? document.getElementById(id) : null;
        if (!existing) {
            var s, r, t;
            r = false;
            s = document.createElement('link');
            s.rel = 'stylesheet';
            s.media = 'all';
            s.type = 'text/css';
            s.href = url;
            if (id) s.id = id;
            var _this = this;
            s.onload = function () {
                r = true;
                $events.emitEvent('css-loaded', [id]);
            };
            t = document.getElementsByTagName('link')[0];
            t.parentNode.insertBefore(s, t);
            this.loadedCss.push(id);
        } else if (existing !== null) {
            $events.emitEvent('css-loaded', [id]);
        }
    },
    range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx);
    },
    camelToKebab(string) {
        return string
            .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
            .replace(/([A-Z])([A-Z])(?=[a-z])/g, '$1-$2')
            .toLowerCase();
    },
    startLoading(key) {
        if (root_app) {
            var index = root_app.$store.state.loading.indexOf(key);
            if (index === -1) {
                root_app.$store.state.loading.push(key);
            }
        }
    },
    stopLoading(key) {
        if (root_app) {
            var index = root_app.$store.state.loading.indexOf(key);
            if (index !== -1) {
                root_app.$store.state.loading.splice(index, 1);
            }
        }
    },
    isLoading(key) {
        if (root_app) {
            return root_app.$store.state.loading.indexOf(key) !== -1;
        }
    },
    parseGoogleAddressComponent(components) {
        var address = {};
        components.forEach(function (component) {
            var type = component.types[0];
            address[type] = component.short_name;
        });

        var out = {};

        if (address.hasOwnProperty('postal_code')) {
            out.zip = address.postal_code;
        }
        if (address.hasOwnProperty('administrative_area_level_2')) {
            out.city = address.locality;
        }
        if (address.hasOwnProperty('locality')) {
            out.city = address.locality;
        }
        if (address.hasOwnProperty('administrative_area_level_1')) {
            out.state = address.administrative_area_level_1;
        }
        if (address.hasOwnProperty('route') || address.hasOwnProperty('neighborhood') || address.hasOwnProperty('street_number')) {
            var street_components = [];
            var street = null;
            if (address.street_number) {
                street_components.push(address.street_number);
            }
            if (address.route) {
                street_components.push(address.route);
            }
            if (street_components.length) {
                street = street_components.join(' ');
            }
            if (address.neighborhood) {
                street += ', ' + address.neighborhood;
            }
            out.street = street;
        }
        return out;
    },
    formatAmount(amount, decimal_places) {
        if (typeof decimal_places == 'undefined') {
            decimal_places = 2;
        }

        amount = this.isNumeric(amount) ? parseFloat(amount) : 0;

        var formatted = amount.toFixed(decimal_places).replace(/./g, function (c, i, a) {
            return i && c !== "." && ((a.length - i) % 3 === 0) ? ',' + c : c;
        });

        return formatted;
    },
    isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    arrayUnique(list) {
        return list.filter((x, i, a) => a.indexOf(x) == i);
    },
    toElFormat(db_format) {
        switch (db_format) {
            case 'DD-MM-YYYY':
                return 'dd-MM-yyyy';
                break;
            case 'MM-DD-YYYY':
                return 'MM-dd-yyyy';
                break;
            case 'YYYY-MM-DD':
                return 'yyyy-MM-dd';
                break;
            case 'DD.MM.YYYY':
                return 'dd.MM.yyyy';
                break;
            case 'MM.DD.YYYY':
                return 'MM.dd.yyyy';
                break;
            case 'MM/DD/YYYY':
                return 'MM/dd/yyyy';
                break;
            case 'Do/MM/YYYY':
                return 'dd/MM/yyyy';
                break;
            case 'MM/Do/YYYY':
                return 'MM/dd/yyyy';
                break;
            default:
            // code block
        }
    },
}
