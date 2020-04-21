import {AbilityBuilder} from '@casl/ability';

export const customerRoles = ['r_customer'];
export const teamRoles = ['r_team'];
export const adminRoles = ['r_admin', 'r_accountant', 'r_marketing', 'r_developer', 'r_staff'];
export const superAdminRoles = ['super_admin'];

export const defaultAbilities = AbilityBuilder.define({subjectName}, can => {
    can('manage', 'role_anonymous');
});

export function defineRulesFor(user) {
    const rules = abilitiesModel(user)
        .concat(abilitiesPermission(user)
            .concat(abilitiesRole(user)
                .concat(abilitiesPlan(user))));

    return rules;
}

// data = user or company with feature_keys field
export function abilitiesPlan(data) {
    const {can, cannot, rules} = AbilityBuilder.extract();

    if (data.feature_keys) {
        data.feature_keys.forEach((feature_key) => {
            can('manage', feature_key);
        });
    }

    return rules;
}

function subjectName(subject) {
    return !subject || typeof subject === 'string' ? subject : subject.modelName;
}

function abilitiesModel(user) {
    const {can, rules} = AbilityBuilder.extract();

    if (user.permissionAbilities && Array.isArray(user.permissionAbilities)) {
        user.permissionAbilities.forEach((permission) => {
            // we defin only can rules
            if (permission.models && permission.access) {
                // write = crud
                if (permission.models.write) {
                    permission.models.write.forEach((model) => {
                        can('crud', model);
                    });
                }
                if (permission.models.execute) {
                    permission.models.execute.forEach((model) => {
                        can('execute', model);
                    });
                }
                if (permission.models.read) {
                    permission.models.read.forEach((model) => {
                        can('read', model);
                    });
                }
            }
        });
    }

    return rules;
}

function abilitiesPermission(user) {
    const {can, cannot, rules} = AbilityBuilder.extract();

    if (user.permissionAbilities && Array.isArray(user.permissionAbilities)) {
        user.permissionAbilities.forEach((permission) => {
            if (permission.access) {
                can('manage', permission.resource);
            } else {
                cannot('manage', permission.resource);
            }
        });
    }
    return rules;
}

export function abilitiesRole(user) {
    const {can, cannot, rules} = AbilityBuilder.extract();


    // TODO: posibly alow user to have more than one role
    if (!user.role) {
        can('manage', 'role_anonymous');
    } else if (customerRoles.includes(user.role)) {
        can('manage', 'role_customer');
    } else if (teamRoles.includes(user.role)) {
        can('manage', 'role_team');
    } else if (adminRoles.includes(user.role)) {
        can('manage', 'role_admin');
    } else if (superAdminRoles.includes(user.role)) {
        can('manage', 'role_super_admin');
    }

    return rules;
}

//        cannot('manage', 'Book', { her: "44" });