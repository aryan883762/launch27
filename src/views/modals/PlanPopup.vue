<template>
    <div>
        <el-dialog :close-on-press-escape="false" :show-close="false" :fullscreen="true" :modal="true" :visible.sync="showModal" @close="settingsRedirect" appendToBody custom-class="fullscreen-modal-display">
            <div slot="header"></div>
            <el-container class="modal-body plans-popup">
                <el-row :gutter="20" v-loading="loading" style="width: 100%">
                    <el-col :md="24" :sm="24" :xs="24">

                        <div class="plan-bg-cover" style="padding: 20px;">
                            <el-row>
                                <el-col>
                                    <el-row :gutter="20" class="account-plans2" v-loading="loading" style="max-width: 1000px; margin: 0 auto;">
                                        <el-col class="plan-legend-area">
                                            <h1 class="block-center text-center">
                                                Welcome to Launch27 Version 2!
                                            </h1>
                                            <div class="block-center text-center lower-text">Get started below by choosing a plan.</div>
                                            <el-switch
                                                    style="display: block"
                                                    class="block-center text-center"
                                                    v-model="subscription.recurring"
                                                    :width="60"
                                                    height="35"
                                                    size="large"
                                                    active-text="Annual"
                                                    inactive-text="Monthly"
                                                    active-value="annual"
                                                    inactive-value="monthly"
                                                    active-color="#1DAEFB"
                                                    inactive-color="#1DAEFB">
                                            </el-switch>
                                            <div class="block-center text-center discount-text"><span>(Save 20%)</span></div>
                                        </el-col>

                                        <el-col class="plan-detail-area">
                                            <el-row :gutter="20" style="display: flex;justify-content: center;"">
                                                <el-col :key="plan.name" :md="6" :sm="6" :class="plan.plan_id" :xs="24" v-for="plan in available_plans">
                                                    <el-card :class="getCardClass(plan)" shadow="always">
                                                        <h3 class="text-center lead-header">{{ plan.name }}</h3>
                                                        <p class="text-center second-header" v-if="plan.description">{{ plan.description }}</p>

                                                        <div class="text-center plan-price"><i>$</i> <span>{{ subscription.recurring === "monthly" ? plan.amount : getAnnualAmount(plan) }}</span> <span>{{ subscription.recurring === "monthly" ? '/Mo' : '/Yr' }}</span></div>

                                                        <ul>
                                                            <li v-if="plan.discount > 0 && subscription.recurring === 'annual'">
                                                                <i class="el-icon-discount"></i>
                                                                <span
                                                                >Annual savings: <strong>{{ company_currency }}{{ getDiscount(plan) }}</strong></span
                                                                >
                                                            </li>
                                                            <li v-for="item in plan.list">
                                                                <font-awesome-icon :icon="['fas', 'check']"/>
                                                                <span>{{ item }}</span>
                                                            </li>
                                                        </ul>

                                                        <!-- <el-button @click="changeSubscription(plan.id)" :class="plan.id" round :disabled="subscription.plan_id == plan.id">{{ subscription.plan_id == plan.id ? "Current Plan" : plan.name }}</el-button> -->
                                                        <full-steam-pay-checkout
                                                                :account-id="user.id"
                                                                :amount="subscription.recurring === 'monthly' ? plan.amount : getAnnualAmount(plan)"
                                                                :button-class="plan.id"
                                                                :button-disabled="subscription.plan_id == plan.id"
                                                                :button-text="plan.name"
                                                                :name-on-card="user.first_name + ' ' + user.last_name"
                                                                :on-card-selected="onFullSteamPayCardSelected"
                                                                :on-mounted="onFullSteamPayMounted"
                                                                :on-token-received="onFullSteamPayTokenReceived"
                                                                :show-existing-cards="false"
                                                                :show-button="false"
                                                                :zip-code="user.zip"
                                                                :subscription="true"
                                                                template="modal"
                                                                transaction-type="token"
                                                                v-if="plan.id != 'free'"/>

                                                        <div class="button-place" style="text-align:center;">
                                                            <el-button :type="plan.id === selected_plan ? 'success' : 'primary'" :class="plan.id === selected_plan ? 'selected' : ''" size="small" :disabled="subscription.plan_id === plan.plan_id"
                                                                       @click="changeSubscription(plan.id)">{{ subscription.plan_id === plan.plan_id ? "Current Plan" : "Get Started" }}
                                                            </el-button>
                                                        </div>
                                                    </el-card>
                                                </el-col>
                                            </el-row>
                                        </el-col>

                                        <el-col :md="24" :sm="24" class="tnc-area">

                                            <div class="block-center" v-if="selected_plan" style="text-align:center;">
                                                <small>You chose:</small>
                                                <h3>{{getPlan(selected_plan).name}}</h3>
                                            </div>


                                            <p class="text-center tnc-title">Please read our terms and conditions below</p>
                                            <div class="tnc">
                                                <p class="tnc-header">Agreement.</p>

                                                <p>By clicking "Start your free trial," as an individual or as an authorized representative of client, you as client or client which you represent (“you”), agree to be bound by all terms and conditions of this Services Agreement (“Agreement”), including, without limitation, all documents, policies, and procedures incorporated herein by reference.
                                                    This Agreement is a binding contract between Launch 27 Software, LLC (“Launch 27” or “we”) and you and/or the company or other legal entity that you represent (collectively, “you”) for the use of Launch 27’s services (“Services”). Launch 27 and you are referred to individually as a “party” and collectively as the “parties”. If you are entering
                                                    into this Agreement as an individual, you represent and warrant that you are over the age of eighteen (18) and possess the legal capacity to bind yourself to its terms and conditions. If you are entering into this Agreement on behalf of a business organization or entity, you represent and warrant that you are duly authorized to bind that entity
                                                    to this Agreement.</p>

                                                <p class="tnc-header">Services.</p>
                                                <p>All Services made available to you under this Agreement, including any related support services or documentation we may provide, are collectively referred to in this Agreement as the “Services”. We reserve the right to modify the Services at any time and without advance notice. At no time, and under no circumstances, does this Agreement represent
                                                    a sale or license of the intellectual property contained within the Services or any software version of Launch 27 (including any copy or update of the same).</p>

                                                <p>Your access to and use of the Service is conditioned upon your acceptance of and compliance with the terms and conditions of this Agreement (“Terms”). These Terms apply to all visitors, users and others who wish to access or use the Service.</p>
                                                <p>This Agreement forms a binding contract between you and Launch 27. If you do not agree to be bound by all of the terms and conditions of this Agreement, then you may not use the Services.</p>


                                                <p class="tnc-header">Communications</p>
                                                <p>By creating an Account, as defined below, for our Services, you agree to subscribe to newsletters, marketing or promotional materials and other information we may send you. However, you may opt-out of receiving any, or all, of these communications from us by following the unsubscribe link or instructions provided in any email we send.</p>

                                                <p class="tnc-header">Subscriptions</p>
                                                <p>Some portions of the Service are billed on a subscription basis (“Subscription(s)”). You will be billed in advance on a recurring and periodic basis (“Billing Cycle”). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan which you select. At the end of each Billing Cycle, your Subscription will
                                                    automatically renew under the same conditions unless you or Launch 27 cancel the Subscription. You may cancel your Subscription renewal by contacting Launch 27 customer support team.</p>

                                                <p>A valid payment method, including credit card, is required to process the payment for your Subscription. You must provide Launch 27 with accurate and complete billing information, including full name, address, state, zip code, telephone number, and valid payment method information. By submitting such payment information, you authorize Launch 27 to
                                                    charge all Subscription fees incurred through your account to any such payment instruments.</p>

                                                <p>Should automatic billing fail for any reason, Launch 27 will send you an electronic invoice indicating that you must proceed by other means, prior to a deadline date, to make full payment for the billing period as stated on the invoice.</p>

                                                <p class="tnc-header">Free Trial</p>
                                                <p>Launch 27 may, at its sole discretion, offer a Subscription with a free trial for a limited period of time (“Free Trial”).</p>

                                                <p>You may be required to enter your billing information in order to sign up for the Free Trial.</p>

                                                <p>If you do enter your billing information when signing up for the Free Trial, you will not be charged by Launch 27 until the Free Trial has expired, or until your Free Trial has been ended early at your discretion. On the last day of the Free Trial period, unless you cancelled your Subscription, you will be automatically charged the applicable
                                                    Subscription fees for the type of Subscription you have selected.</p>
                                                <p>At any time and without notice, Launch 27 reserves the right to (i) modify the terms and conditions of the Free Trial offer, or (ii) cancel such Free Trial offer.</p>


                                                <p class="tnc-header">Fee Changes</p>
                                                <p>Launch 27, in its sole discretion, and at any time, may modify the Subscription fees for the Subscriptions. Any Subscription fee change will become effective at the end of the then-current Billing Cycle.</p>
                                                <p>Launch 27 will provide you with a reasonable prior notice of any change in Subscription fees to give you an opportunity to terminate your Subscription before such change becomes effective.</p>
                                                <p>Your continued use of the Service after the Subscription fee change comes into effect constitutes your agreement to pay the modified Subscription fee amount.</p>

                                                <p class="tnc-header">Refunds</p>
                                                <p>Certain refund requests for Subscriptions may be considered by Launch 27 on a case-by-case basis and granted in sole discretion of Launch 27.</p>

                                                <p class="tnc-header">Content</p>
                                                <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material (“Content”). You are responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>

                                                <p>By posting Content on or through the Service, you represent and warrant that: (i) the Content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms, and (ii) that the posting of your Content on or through the Service does not violate the privacy rights, publicity
                                                    rights, copyrights, contract rights or any other rights of any person or entity. We reserve the right to terminate the Account of anyone found to be infringing intellectual property rights.</p>

                                                <p>You retain any and all rights to any Content you submit, post or display on or through the Service and you are responsible for protecting those rights. We take no responsibility and assume no liability for Content you or any third party posts on or through the Service. However, by posting Content using the Service you grant us the right and
                                                    license to use, modify, publicly perform, publicly display, reproduce, and distribute such Content on and through the Service.</p>

                                                <p>Launch 27 has the right but not the obligation to monitor and edit all Content provided by users.</p>

                                                <p class="tnc-header">Accounts</p>
                                                <p>When you create an account (“Account”) with us, you represent and warrant that you are eighteen (18) years old or older, and that the information you provided us is accurate, complete, and current at all times. Inaccurate, incomplete, or non-current information may result in the immediate termination of your Account.</p>

                                                <p>You are responsible for maintaining the confidentiality of your Account and password, including but not limited to the restriction of access to your Account. You agree to accept responsibility for any and all activities or actions that occur pursuant to your Account and/or password. You must notify us immediately upon becoming aware of any breach
                                                    of security or unauthorized use of your Account.</p>

                                                <p>You may not use as a username the name of another person or entity that is not lawfully available for your use, a name or trademark that is subject to any property rights of another person or entity, without appropriate authorization. You may not use as a username any name that is offensive, vulgar or obscene.</p>

                                                <p class="tnc-header">Taxes</p>
                                                <p>You shall be solely responsible for and agree to pay, indemnify, and hold Launch 27 harmless from any and all sales, use, communications, excise, or similar tax or duty, and any other tax not based on Launch 27’s net income, including penalties and interest and any associated professional fees, and all other imposts levied upon or chargeable with
                                                    respect to the use, license, sale, or delivery of the Services or other deliverables in respect of this Agreement, and any costs associated with the collection or withholding of any of the foregoing items (collectively, “Taxes”).</p>

                                                <p>Intellectual Property</p>
                                                <p>Launch 27 owns all right, title and interest in and to the Services and to any suggestions, ideas, enhancement requests, feedback, recommendations or other information provided by you or any other party relating to the Services. This Agreement is not a sale and does not convey any rights of ownership in or related to the Services or other
                                                    intellectual property. The Launch 27 name, the Launch 27 logo, and the product names associated with the Services are trademarks of Launch 27 or third parties, and no right or license is granted to use them.</p>

                                                <p>You may not copy, modify, download or transfer any component of the Services, in whole or in part. You may not reverse engineer, disassemble, decompile, or translate any portion of the Services, attempt to derive the source code of any software component of the Services, create any derivative work from the Services, or authorize any third party to
                                                    do any of the foregoing. Any attempt to transfer any of the rights, duties or obligations under this Agreement is void. You may not rent, lease, loan, resell for profit, or distribute the Services, or any part thereof, nor may you provide access to the Services over the Internet or any network for use by any third parties. You may not remove or
                                                    alter any proprietary notice or legend regarding Launch 27’s proprietary rights in the Services. You may not use the Services except in accordance with applicable laws and regulations.</p>

                                                <p>You acknowledge that the Services may display content, like photos, graphical material, trademarks, and other information and media provided to us by third parties (collectively, “Third-Party Content”). YOU ACKNOWLEDGE AND AGREE THAT LAUNCH 27 IS NOT RESPONSIBLE FOR THE ACCURACY, COMPLETENESS, CURRENCY, LEGALITY, SUITABILITY OR QUALITY OF
                                                    THIRD-PARTY CONTENT AND SHALL HAVE NO LIABILITY TO YOU IN CONNECTION WITH THIRD-PARTY CONTENT OR IN CONNECTION WITH ANY PRODUCT, SERVICE OR OTHER OFFERING DESCRIBED THEREIN. You may not reproduce, publicly perform, publicly display, modify, distribute or create derivative works of any Third-Party Content, nor use any Third-Party Content except as
                                                    provided by the standard functionality offered within the Services.</p>

                                                <p>Launch 27 respects the intellectual property rights of third parties. In the event that you have a good faith belief that your copyrights have been violated by the use or display of certain content within the Services, it is our policy to investigate and promptly undertake efforts to resolve the issue. To notify us regarding an alleged copyright
                                                    violation, you must provide us with all of the following information: (i) a physical or electronic signature of a person authorized to act on behalf of the owner of the exclusive right that is allegedly infringed; (ii) identification of the copyrighted work(s) claimed to have been infringed, and information reasonably sufficient to permit us to
                                                    locate the material; (iii) information reasonably sufficient to permit us to contact you, such as an address, telephone number, and if available, an electronic mail address at which you may be contacted; (iv) a statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright
                                                    owner, its agent, or the law; and (v) a statement that the information in the notification is accurate, and under penalty of perjury, that you are authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.</p>

                                                <p>For this notification to be effective, you must provide it to Launch 27’s designated agent at:</p>

                                                <div class="address">
                                                    <p>Launch 27 Software</p>
                                                    <p>c/o Fullsteam Operations</p>
                                                    <p>Attn. Ed Graf</p>
                                                    <p>197 East University Drive</p>
                                                    <p>Auburn, AL 36832</p>
                                                </div>


                                                <p class="tnc-header">Links To Other Websites</p>
                                                <p>Our Service may contain links to third party websites or services that are not owned or controlled by Launch 27.</p>
                                                <p>Launch 27 has no control over, and assumes no responsibility for the content, privacy policies, or practices of any third party websites or services. We do not warrant the offerings of any of these entities/individuals or their websites.</p>

                                                <p>You acknowledge and agree that Launch 27 shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such third party websites or services.</p>

                                                <p>We strongly advise you to read the terms and conditions and privacy policies of any third party websites or services that you visit.</p>

                                                <p class="tnc-header">Termination</p>
                                                <p>In our sole discretion, we may immediately (and without prior notice) suspend or terminate the Services by sending you a written or electronic notice of suspension or termination if one or more of the following occurs: (i) you fail to comply with any provision of this Agreement; (ii) you fail to make any payment when due (i.e. your credit card is
                                                    declined); (iii) we determine, in our sole discretion, that your use of the Services poses a threat to the security or performance of our network or to any of our users or suppliers; (iv) we determine, in our sole discretion, that your use of the Services is illegal, or that it misappropriates or infringes the property rights of Launch 27 or a
                                                    third party; or (v) we discover that you provided us with false information when you subscribed for Services, or that you lacked the capacity to enter into this Agreement at the time of its consummation. All terms of this Agreement which should reasonably survive termination of the Agreement shall survive such termination.</p>

                                                <p>If you wish to terminate your Account, please notify us and discontinue using the Service.</p>

                                                <p>All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.</p>

                                                <p class="tnc-header">Indemnification</p>
                                                <p>You agree to indemnify, defend and hold Launch 27 and its employees, agents, shareholders, members, officers, directors, successors and assigns harmless from and against any and all claims, damages, liabilities, costs, settlements, penalties and expenses (including attorneys’ fees, expert’s fees and settlement costs) arising out of or relating to
                                                    any suit, action, proceeding, arbitration, subpoena, claim or demand brought or asserted by a third party pursuant to any theory of liability against Launch 27 arising out of or relating to any one or more of the following: (i) a breach by you of this Agreement; (ii) the use of the Services by you or your end users, or any Content or information
                                                    on the Services; (iii) the alleged or actual infringement or misappropriation of any intellectual property right or other proprietary right by you, or by your agents, representatives or end users; (iv) your relationship with the manufacturer of any software installed or stored on the Services; or (v) your failure to use reasonable security
                                                    precautions. We will provide you with written notice of the existence of any basis for indemnification and we will select our defense counsel. You will have the right to approve any settlement, but you may not unreasonably withhold your approval. You agree to indemnify us for all costs, expenses and liabilities as they become due.</p>

                                                <p class="tnc-header">Limitation of Liability</p>
                                                <p>In no event shall Launch 27, nor its directors, members, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability
                                                    to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed
                                                    of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose. Launch 27’s entire liability for all claims in the aggregate arising from your use of a Services acquired hereunder will not exceed the amount of any actual direct damages up to the amounts paid in the prior three (3) months
                                                    for the Service that is the subject of the claim, regardless of the basis of the claim. This limit applies collectively to Launch 27, its parent, subsidiaries and contractors.</p>

                                                <p class="tnc-header">Disclaimer</p>
                                                <p>Your use of the Service is at your sole risk. The Service is provided on an “AS IS” and “AS AVAILABLE” basis. The Service is provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.</p>

                                                <p>Launch 27 its subsidiaries, affiliates, and its licensors do not warrant that a) the Service will function uninterrupted, secure or available at any particular time or location; b) any errors or defects will be corrected; c) the Service is free of viruses or other harmful components; or d) the results of using the Service will meet your
                                                    requirements.</p>

                                                <p>Neither we nor any of our employees, agents, representatives, assigns or service suppliers will be liable for unauthorized access (i.e., hacking) into our servers or your transmission facilities, premises or equipment, or for unauthorized access to data files, programs, procedures or information thereon, unless and only to the extent that this
                                                    disclaimer is prohibited by applicable law.</p>

                                                <p class="tnc-header">Exclusions</p>
                                                <p>Some jurisdictions do not allow the exclusion of certain warranties or the exclusion or limitation of liability for consequential or incidental damages, so the limitations above may not apply to you.</p>

                                                <p class="tnc-header">Governing Law</p>
                                                <p>This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without giving effect to applicable principles of conflicts of law to the extent that the application of the laws of another jurisdiction would be required thereby. In case of any dispute related to this Agreement, the parties agree to submit to
                                                    personal jurisdiction in the State of Delaware. Furthermore, the parties hereby irrevocably and unconditionally submit to the exclusive jurisdiction of any court of the State of Delaware or any federal court sitting in the State of Delaware for purposes of any suit, action or other proceeding arising out of this Agreement. THE PARTIES HEREBY
                                                    IRREVOCABLY WAIVE ANY AND ALL RIGHTS TO A TRIAL BY JURY IN ANY ACTION, SUIT OR OTHER PROCEEDING ARISING OUT OF OR RELATING TO THE TERMS, OBLIGATIONS AND/OR PERFORMANCE OF THIS AGREEMENT.</p>

                                                <p class="tnc-header">Amendment</p>
                                                <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least thirty (30) days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.</p>

                                                <p>By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms. If you do not agree to the new terms, you are no longer authorized to use the Service.</p>

                                                <p class="tnc-header">Notices</p>
                                                <p>All notices, demands, and other communications provided for hereunder shall be in writing and mailed (by certified mail, return receipt requested), sent, or delivered (including by way of overnight courier service or email), to each party, to such other person and/or at such other address, number or email address as shall be designated by such
                                                    party in a written notice (including electronic) to the other party. All such notices, demands, and communications shall be effective when received, unless otherwise stated herein.</p>

                                                <p class="tnc-header">Confidentiality</p>
                                                <p>Each party agrees and undertakes that during the term of this Agreement and thereafter in perpetuity it will keep confidential and will not use for its own purposes nor without the prior written consent of the other party disclose to any third party any information of a confidential nature (including without limitation trade secrets and
                                                    information of commercial value) which may become known to that party from the other party ("Confidential Information") unless the information (i) is public know ledge or (ii) is already known to that party at the time of disclosure or (iii) subsequently becomes public knowledge other than by breach of this Agreement or (iv) subsequently comes
                                                    lawfully into the possession of that party from a third party or (v) is required to be disclosed by law or court order provided that the recipient promptly notifies the discloser in writing of the requirement for disclosure and limits the content and distribution of such disclosure to the extent reasonably possible.</p>

                                                <p class="tnc-header">Assignment</p>

                                                <p>You may not assign this Agreement or resell the right to use the Services without our prior written consent. We may assign or subcontract this Agreement at any time. This Agreement will be binding upon and inure to the benefit of all of our successors and assigns, which will be bound by all of the obligations of their predecessors or
                                                    assignors.</p>

                                                <p class="tnc-header">Non-Waiver</p>
                                                <p>Launch 27’s failure at any time to require strict performance from you of any of the provisions hereof shall not waive or diminish Launch 27's right thereafter to demand strict compliance therewith or with any other provision. Waiver of any default shall not waive any other default. Launch 27’s rights hereunder are cumulative and not
                                                    alternative.</p>

                                                <p class="tnc-header">Severability</p>
                                                <p>Should any portion of this Agreement be held to be invalid, unenforceable or void, such holding shall not have the effect of invalidating the remainder of this Agreement or any other part thereof. The parties hereby agree that the portion so held to be invalid, unenforceable, or void shall, if possible, be deemed amended or reduced in scope or
                                                    entirely severed if necessary.</p>

                                                <p class="tnc-header">Force Majeure</p>
                                                <p>Launch 27 will not be liable for any delay or failure to perform any obligation under this Agreement where the delay or failure results from any cause beyond Launch 27’s reasonable control, including acts of God, labor disputes or other industrial disturbances, systemic electrical, telecommunications, or other utility failures, earthquake, storms
                                                    or other elements of nature, blockages, embargoes, riots, acts or orders of government, acts of terrorism, or war.</p>

                                                <p class="tnc-header">Entire Agreement</p>
                                                <p>This Agreement contains the entire agreement between the parties hereto with respect to the subject matter contained herein. There are no other agreements, written or unwritten, that shall bind the parties. Additional or different terms in any written communication from you, including any purchase order or request for Services, are void.</p>

                                                <div class="address">
                                                    <p class="tnc-header">Contact Us</p>
                                                    <p>If you have any questions or suggestions, you may contact us as follows:</p>
                                                    <p>Email: <a href="mailto:support@launch27.com">support@launch27.com</a></p>
                                                    <p>Phone: (334) 329-6092</p>
                                                    <p>If you have questions concerning our Privacy Policy, you may contact us as follows:</p>
                                                    <p>Email address: <a href="mailto:ccpa@fullsteam.com">ccpa@fullsteam.com</a></p>
                                                    <p>By mail: Launch 27 Software, C/O Fullsteam Operations, Attn: Compliance, 197 East University Drive, Auburn, Alabama 36832</p>
                                                </div>
                                            </div>
                                        </el-col>


                                        <el-col :md="24" :sm="24" class="tnc-footer-area">
                                            <p class="text-center" v-if="selected_plan">Scale up plan cost : <strong>${{getPlan(selected_plan).amount}}</strong></p>
                                            <p class="text-center" v-if="selected_plan">Lifetime discount cost : {{ ($auth.user().company.discount_type === 'percent') ? $auth.user().company.discount_amount + '%' : $currency + '' + $auth.user().company.discount_amount}}</p>
                                            <p class="text-center" style="font-weight: bold; font-size: 17px;" v-if="selected_plan && getLoyaltyDiscount() > 0" >Onetime loyalty discount: ${{getLoyaltyDiscount()}}</p>

                                            <p class="text-center" v-if="selected_plan" style="color: #1fb6ff;font-size: 25px;font-weight: bold">Total charged today - $1</p>
                                            <p class="text-center" style="font-style: italic">Total charged April 1st (All monthly plans will be charged on the first of every month ) - $0</p>
                                            <p class="text-center">
                                                <el-checkbox v-model="tnc_agreed">I agree to Launch27's terms and conditions</el-checkbox>
                                            </p>

                                            <div class="text-center">
                                                <el-button type="primary" :disabled="!tnc_agreed" round @click="acceptAndCharge">Go to Dashboard</el-button>
                                            </div>
                                        </el-col>
                                    </el-row>
                                </el-col>
                            </el-row>
                        </div>
                    </el-col>
                </el-row>
            </el-container>
        </el-dialog>
    </div>
</template>

<script>

    import FullSteamPayCheckout from "@/components/FullSteamPayCheckout";
    import currencyData from 'currency-data';

    export default {
        name: 'PlansPopUp',
        props: {
            profile: {
                type: Object,
                required: false
            }
        },
        components: {
            "full-steam-pay-checkout": FullSteamPayCheckout
        },
        data: () => {
            return {
                subscription: {},
                loading: true,
                company: false,
                available_plans: [],
                user: {},
                selected_plan: null,
                fsPayInstance: null,
                company_currency: '',
                tnc_agreed: false,
                showModal: false,
                cardToken: false,
                cardId: false
            };
        },
        watch: {},

        created() {
            this.getCompanyPlan();
            this.$events.emitEvent('track-page')
        },

        mounted() {
            this.showModal = true;
            if (this.$can("manage", "role_super_admin")) {
                if (this.profile)
                    this.user = this.profile;
                else
                    this.user = this.$auth.user()
            } else {
                this.user = this.$auth.user();
            }
        },

        methods: {
            getPlan(id) {
                let plan = this.available_plans.find((plan) => {
                    return id === plan.id
                })

                if (plan)
                    return plan

                return {}
            },
            changeSubscription(plan_id) {
                this.selected_plan = plan_id;

                //check what payment gateway to use Stripe or Launch27 Pay based on Country


                return false;

                //first what is the amount to charge
                //is there a trial period?
                //get plan charge and payment method

                this.loading = true;

                this.axios
                    .get("/subscriptions/upgrade-intent", {
                        params: {
                            sub_id: this.subscription.id,
                            plan_id: plan_id,
                            recurring: this.subscription.recurring,
                            success_url: window.location.href,
                            cancel_url: window.location.href
                        }
                    })
                    .then(res => {
                        if (res.data.payment_mode === "stripe") {
                            this.stripePayment(res.data.checkout_session_id);
                        } else {
                            this.$alert("Launch27 Pay is not yet ready");
                        }
                    })
                    .catch(err => {
                        this.$helpers.errorHandle(err, this);
                    })
                    .finally(_ => {
                        this.loading = false;
                    });
            },

            stripePayment(checkout_session_id) {
                let stripe = Stripe(process.env.VUE_APP_STRIPE_PK);
                this.loading = true;

                stripe
                    .redirectToCheckout({
                        // Make the id field from the Checkout Session creation API response
                        // available to this file, so you can provide it as parameter here
                        // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
                        sessionId: checkout_session_id
                    })
                    .then(result => {
                        // If `redirectToCheckout` fails due to a browser or network
                        // error, display the localized error message to your customer
                        // using `result.error.message`.
                        this.loading = false;
                        this.$helpers.errorHandle(result.error.message);
                    });
            },
            settingsRedirect() {
                this.$router.push('/dashboard')
            },

            showPayments() {
                this.$events.emitEvent("account:profile:change-tab", ["payment"]);
            },
            getCardClass(plan) {
                let data = {current: this.subscription.plan_id === plan.plan_id, 'plan-card': true};
                switch (plan.id) {
                    case "free":
                        data.free = true;
                        break;

                    case "small_team":
                        data.start_up = true;
                        break;

                    case "expansion":
                        data.scaling = true;
                        break;

                    case "enterprise":
                        data.enterprise = true;
                        break;
                }

                return data;
            },
            getAnnualAmount(plan) {
                return ((plan.amount) * 12).toFixed(0);
            },
            getDiscount(plan) {
                let discount = plan.amount * (plan.discount / 100);
                return (discount * 12).toFixed(0);
            },
            onFullSteamPayMounted(fsInstance) {
                if (fsInstance) {
                    this.fsPayInstance = fsInstance;
                }
            },
            onFullSteamPayTokenReceived(token) {
                //this.cardToken = token
                this.performUpgrade({cardToken: token});
            },
            onFullSteamPayCardSelected(cardId) {
                //this.cardId = cardId
                this.performUpgrade({cardId: cardId});
            },
            performUpgrade(params) {
                this.loading = true;

                var _url = "/bookings";
                if (this.paymentFor == "subscription") _url = "/subscriptions/upgrade";
                if (this.paymentFor == "gift-card") _url = "/gift_cards";

                var _params = Object.assign({}, params);
                _params.planId = this.selected_plan;
                _params.recurring = this.subscription.recurring;
                _params.userId = this.user.id;

                this.axios({method: "POST", url: "/subscriptions/upgrade", data: _params})
                    .then(response => {
                        if (this.$can("manage", "role_super_admin")) {
                            this.getCompanyPlan();
                        } else {
                            //
                            this.axios.patch('/companies/current', {
                                'terms_accepted': true,
                                date_terms_accepted: this.$moment().toISOString()
                            })
                                .then(res => {
                                    this.settingsRedirect()
                                })
                                .catch(err => {
                                    this.$helpers.errorHandle(err)
                                })
                                .finally(() => {
                                    this.loading = false
                                })
                        }
                    })
                    .catch(error => {
                        this.$helpers.errorHandle(error, this)
                        this.loading = false
                    })
                    .finally(_ => {

                    });
            },
            getCompanyPlan() {
                //get company susbscription
                this.loading = true;

                let getCompany = context => {
                    return new Promise((resolve, reject) => {
                        let url = '/companies/current';
                        // for superadmin we get the company from the url
                        if (this.$can("manage", "role_super_admin")) {
                            url = '/companies/' + this.$route.params.id;
                        }
                        this.axios
                            .get(url, {params: {filter: {include: "subscription"}}})
                            .then(res => {
                                if (res.data && res.data.subscription) {
                                    context.subscription = res.data.subscription;
                                    context.company = res.data;
                                }
                                // to display superadmin selected company currency
                                if (res.data && res.data.currency) {
                                    this.company_currency = res.data.currency.symbol
                                } else if (res.data && res.data.country) {
                                    let primaryCurrencyISOCode = res.data.country.currency.split(',')[0];
                                    this.company_currency = currencyData.getCurrencyByCurrencyISOCode(primaryCurrencyISOCode).symbol;
                                }
                                return resolve();
                            })
                            .catch(err => {
                                return reject(err);
                            });
                    });
                };

                let getAvailablePlans = context => {
                    return new Promise((resolve, reject) => {
                        let params = {};
                        if (this.$can("manage", "role_super_admin")) {
                            params = {all: true};
                        }else{
                            params.version = context.company.version;
                        }
                        this.axios
                            .get("/subscriptions/available-plans", {params: params})
                            .then(res => {
                                context.available_plans = res.data;
                                resolve();
                            })
                            .catch(err => {
                                reject(err);
                            });
                    });
                };

                async function fetchData(context) {
                    try {
                        await getCompany(context);
                        await getAvailablePlans(context);
                        context.loading = false;
                    } catch (err) {
                        context.loading = false;
                    }
                }

                fetchData(this).then(() => {
                });
            },
            acceptAndCharge() {

                if (this.fsPayInstance) {
                    this.fsPayInstance.showModal();
                }


            },
            getLoyaltyDiscount() {
                let selected_plan = this.getPlan(this.selected_plan)
                let daysInMonth = this.$moment().daysInMonth();
                let daysPassed = this.$moment().format('D')
                let discount = selected_plan.amount * (selected_plan.discount / 100)

                let amountToCharge = 0;

                if (this.subscription.recurring === 'monthly') {
                    //only charge for what is left for this month
                    amountToCharge = (selected_plan.amount / daysInMonth) * (daysInMonth - daysPassed)
                } else if (this.subscription.recurring === 'annual') {
                    amountToCharge = 0
                }

                //format amount
                amountToCharge = parseFloat(amountToCharge.toFixed(2));
                return amountToCharge
            }
        }
    };
</script>
<style lang="scss">
    .modal-body.plans-popup {
        .plan-bg-cover {
            background-size: cover;
            background: url("../../assets/Pricing_Page_V2-popover.png") no-repeat top right;
        }

        .account-plans2 {

            .plan-legend-area {
                color: #012232;
                margin-bottom: 15px;

                .lower-text {
                    margin-bottom: 15px;
                    margin-top: 5px;
                }

                .el-switch {
                    margin-bottom: 10px;

                    .el-switch__core {
                        height: 26px;
                        border-radius: 50px;

                        &::after {
                            top: 4px;
                            left: 4px;
                        }
                    }

                    &.is-checked {
                        .el-switch__core {
                            &::after {
                                top: 4px;
                                left: 95%;
                            }
                        }
                    }
                }

                .discount-text {
                    font-size: 10px;
                    text-transform: uppercase;
                    font-weight: bold;
                    color: #9092A4;
                }
            }

            .plan-detail-area {

                .start_up, .expansion, .scale_up, .enterprise {

                    .el-card {
                        .el-card__body {
                            position: relative;
                            min-height: 400px;

                            .lead-header {
                                margin-bottom: 0;
                            }

                            .second-header {
                                margin-top: 0;
                                color: #012232;
                                font-size: 10px;
                                font-weight: bold;
                            }

                            .button-place {
                                position: absolute;
                                bottom: 40px;
                                left: 0;
                                right: 0;

                                text-align:center;

                                .el-button {



                                    &:not(.el-button--success) {
                                        background-color: #FC531F;
                                        border-color: #FC531F;
                                    }

                                    &.selected{
                                        background-color: #1fde16 !important;
                                        border-color: #1fde16 !important;
                                    }


                                    color: white;
                                    margin: 0 auto;
                                    display: block;
                                }
                            }
                        }

                        &.current {
                            .el-card__body button {
                                background-color: #fc531e69;
                            }
                        }
                    }

                    .plan-price {
                        font-size: 25px;
                        font-weight: bold;
                    }
                }

                .start_up .plan-price {
                    color: #1fb6ff;
                }

                .expansion .plan-price {
                    color: #2FDD30;
                }

                .scale_up .plan-price {
                    color: #D5AD2C;
                }

                .enterprise .plan-price {
                    color: #FA8134;
                }

                ul {
                    list-style: none;
                    padding: 0;
                    min-height: 225px;

                    li {
                        padding: 5px 0;
                        font-size: 10px;

                        .svg-inline--fa {
                            margin-right: 8px;
                            color: #1fb6ff;
                        }
                    }
                }


            }


            .tnc-area {
                .tnc-title {
                    font-weight: bold;
                }

                .tnc {
                    height: 100px;
                    overflow-y: scroll;
                    border: 1px solid #D0CFCF;
                    padding: 5px 30px;
                    background-color: white;
                }

                p {
                    color: #012232;
                    margin: 0 0 20px 0;
                }

                .tnc-header {
                    font-weight: bold;
                    margin-bottom: 5px;
                }

                .address {
                    margin-bottom: 20px;

                    p {
                        margin: 0;
                    }
                }
            }

            .tnc-footer-area {
                margin-top: 15px;

                p {
                    margin: 5px;
                    color: #022232;
                    font-size: 14px;
                }

            }


            .el-card {
                &.free {
                    .plan-price {
                        color: black;
                    }

                    .el-button {
                        background-color: black;
                        color: white;
                        border: none;
                    }
                }

                &.small_team {
                    .plan-price {
                        color: #1fde16;
                    }

                    .el-button {
                        background-color: #1fde16;
                        color: white;
                        border: none;
                    }
                }

                &.scaling {
                    .plan-price {
                        color: #e4ba14;
                    }

                    .el-button {
                        background-color: #e4ba14;
                        color: white;
                        border: none;
                    }
                }

                &.enterprise {
                    .plan-price {
                        color: #f98329;
                    }

                    .el-button {
                        background-color: #f98329;
                        color: white;
                        border: none;
                    }
                }

                &.current {
                    .el-button {
                        background-color: white;
                        border: none;
                        color: #1fb6ff;
                    }
                }
            }

            .plan-card {
                margin-bottom: 20px;
            }
        }
    }
</style>
