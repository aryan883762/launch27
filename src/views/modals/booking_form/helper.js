"use strict";

export default {
    prepareBookingData: (model, services) => {

        let total_duration = 0;
        //ids of the services purchased.
        let serviceIds = []

        model = JSON.parse(JSON.stringify(model))

        const getServicesBought = (model, company_services) => {
            let data = []


            if (model.services && model.services.length > 0)
                model.services.forEach(service_id => {

                    serviceIds.push(service_id)

                    let selected_service = {id: service_id}

                    //srv is an id
                    let full_service = company_services.find((service) => {
                        return service_id === service.id
                    })


                    if (!full_service) return;


                    if (model.service_options && model.service_options[service_id]) {
                        if (model.service_options[service_id].hourly) {
                            selected_service.hourly = {
                                teams: model.service_options[service_id].hourly.teams,
                                hours: model.service_options[service_id].hourly.hours
                            }

                            //for hourly service its teams X hours
                            total_duration += (full_service.duration * model.service_options[service_id].hourly.teams * model.service_options[service_id].hourly.hours)

                        }

                        if (model.service_options[service_id].pricing_variables) {
                            selected_service.pricing_variables = []

                            for (let x in model.service_options[service_id].pricing_variables) {
                                let selected_pv = model.service_options[service_id].pricing_variables[x]

                                let full_pv = full_service.pricing_variables.find((pv) => {
                                    return pv.id === x
                                })


                                if (selected_pv.not_ranged) {
                                    //add pricing variable duration of selected variable
                                    total_duration += (full_pv.duration * selected_pv.not_ranged)

                                    selected_service.pricing_variables.push({id: full_pv.id, quantity: selected_pv.not_ranged, price_id: full_pv.prices[0].id})
                                }

                                if (selected_pv.ranged) {
                                    total_duration += (full_pv.duration)
                                    selected_service.pricing_variables.push({id: full_pv.id, quantity: null, price_id: selected_pv.ranged.id})
                                }
                            }
                        }
                    }

                    if (model.extras && model.extras.length > 0) {
                        let service_extras = model.extras.filter((extra) => {
                            return extra.service_id === service_id
                        })

                        //go over the extra and add duration
                        service_extras.forEach((s_extra) => {
                            if (!s_extra.hourly) {
                                total_duration += (s_extra.duration * s_extra.quantity)
                            }
                        })

                        if (service_extras.length > 0) {
                            selected_service.extras = service_extras;
                        }
                    }

                    data.push(selected_service)

                })

            return data;
        }

        const getCustomFields = (model) => {
            let data = []
            if (model.customFields && model.customFields.components)
                for (let z in model.customFields.components) {
                    let obj = {}
                    obj = {
                        id: z,
                        label: model.customFields.components[z].attributes.label || model.customFields.components[z].attributes.placeholder,
                        value: model.customFields.components[z].value,
                    }

                    if (model.customFields.components[z].type === 'select' || model.customFields.components[z].type === 'radio') {
                        let option = model.customFields.components[z].attributes.options.find((opt) => {
                            return opt.value == model.customFields.components[z].value
                        })
                        if (option)
                            obj.valueText = option.label
                    }

                    if (model.customFields.components[z].type === 'checkbox') {
                        model.customFields.components[z].value.forEach((value) => {
                            let option = model.customFields.components[z].attributes.options.find((opt) => {
                                return opt.value == value
                            })
                            if (option)
                                obj.valueText += option.label + ", "
                        })
                    }

                    data.push(obj)
                }

            return data
        }

        let booking_data = {
            customer: {
                profile_id: model.profile_id,
                first_name: model.first_name,
                last_name: model.last_name,
                email: model.email,
                referral_source: model.referral_source,
                company: model.company
            },
            locationId: model.locationId,
            arrival_window: model.arrival_window,
            mode_of_booking: model.mode_of_booking,
            payment_type: model.payment_type,
            stripe_payment_method_id: model.stripe_payment_method_id,
            cardId: model.cardId,
            cardToken: (model.cardToken) ? model.cardToken : false,
            fs_card_token: (model.cardToken) ? model.cardToken : false, /*** @deprecated: replaced by cardToken*/
            address: model.address,
            addressId: (model.address) ? model.address.id : null,
            serviceIds:  serviceIds,
            adjustment: Number(model.adjustment),
            adjustment_reason: model.adjustment_reason,
            services: getServicesBought(model, services),
            service_date: model.service_date,
            frequency_options: (model.frequency) ? (model.frequency) : false,
            frequencyId: (model.frequency) ? model.frequency.id : '',
            staff_notes: model.staff_notes,
            staff_notes_access: model.staff_notes_access,
            duration: model.duration,
            estimated_duration: total_duration,
            discount_code: model.discount_code,
            gift_card_code: model.gift_card_code,
            referral_code: model.referral_code,
            team_assignment: model.team_assignment,
            team_requested: model.team_requested,
            team_with_key: model.team_with_key,
            tip: parseFloat(model.tip),
            meta: model.service_options ? {service_options: model.service_options, extras: model.extras} : model.meta,
            customFields: getCustomFields(model),
        }

        if (model.serviceCategoryId != 0) {
            booking_data.serviceCategoryId = model.serviceCategoryId
        }

        return booking_data
    }
}
