-- Sports for organizations listed only as "Multi-sport" (docs/data-fixes/multi-sport-sports.md). Read from each organization's own website, 2026-10-26.
-- Each sport becomes a program on the organization's card (listing 'with_org', with its seasons) and joins its sports so search finds it. NEEDS migration 0015.
-- Safe to run twice: fixed ids, and every insert is skipped when the organization already has a program for that sport.
-- No SQL here: sites that are dead, taken over, closed, or name no sport we list. For a person to look at.

-- NOT A SQL CHANGE. Alabama Head Injury Foundation (AL), id 8449b4d4-0cf8-5077-9074-44d19ae8469e: ok: Brain injury support org; recreational camps and support groups, no named sports. Source: https://www.ahif.org/recreational-camps.html

-- NOT A SQL CHANGE. Birmingham VA Medical Center (AL), id fc714a1a-6986-4f81-9935-932a3732afd6: unclear: VA medical center homepage; only a one-off adaptive cycling event story, no standing sports program. Source: https://www.va.gov/birmingham-health-care/

-- NOT A SQL CHANGE. Exceptional Foundation Gulf Coast (AL), id fc3bb9c6-676e-548d-a9f7-8bd3d561cd32: unclear: Social/recreation day program; site pages render empty, no sports named. Source: https://www.exceptionalfoundationgc.org/

-- NOT A SQL CHANGE. Exceptional Foundation of East Alabama (AL), id 55664ccc-1a9d-5bdb-bf5b-796f77e70ade: ok: Day programs (academics, life skills, arts, field trips); no sports. Source: https://efofea.org/programs/

-- NOT A SQL CHANGE. Team River Runner Ft. Campbell (AL), id 3bc3cca6-8519-47c5-a88d-146942fc0ce7: unclear: Listed URL is the generic TRR homepage; no Fort Campbell chapter on TRR's chapter list (Fort Campbell is KY/TN, not AL). Source: https://www.teamriverrunner.org/get-involved/chapters/

-- NOT A SQL CHANGE. City of Phoenix Adaptive Recreation (Daring Adventures) (AZ), id 9c0053e7-479f-415f-97ac-1c277cffac95: ok: URL redirects; page lists only Special Olympics bowling, cheer, cooking class and summer camp. No Daring Adventures program found. Source: https://www.phoenix.gov/administration/departments/parks/classes-programs/adaptive-recreation.html

-- NOT A SQL CHANGE. Surprise Arizona Adaptive Recreation (AZ), id 9881159d-700c-4592-8310-d1d4336cce77: unclear: Buddy Sports and Special Olympics pages exist but their content is script-loaded and unreadable; no sports confirmed. Source: https://surpriseaz.gov/561/Buddy-Sports

-- NOT A SQL CHANGE. Adaptive CrossFit (CA), id 2af7b089-245e-45fb-9d5b-d389f5f8c6e3: ok: Adaptive strength and conditioning class at a CrossFit gym; no listed sport. Source: https://movement-rx.com/san-diego-adaptive-training/

-- NOT A SQL CHANGE. C.O.R.E. Centers, LLC (CA), id 49d51c6b-df0d-42be-8edc-624ca32f9d05: ok: Adaptive rehab/fitness gym; no sports. Source: http://www.centerofrestorativeexercise.com/what-we-do

-- NOT A SQL CHANGE. City of Santa Barbara Adapted Recreation — Bowling League (CA), id 917223f1-99f2-47ec-8394-be8f38b15a7b: ok: Bowling league only (no matching key). Source: https://santabarbaracity.librarycalendar.com/event/adapted-recreation-bowling-7183

-- NOT A SQL CHANGE. Incight (CA), id 20d78885-54c6-4266-bcef-f30b277788ee: ok: Disability education and employment nonprofit (Portland); no sports. Source: http://www.incight.org

-- NOT A SQL CHANGE. Living Spinal (CA), id 11df7dec-1fe6-43e2-8841-4a2fbad0cdf2: unclear: Online wheelchair and equipment retailer, not a program provider. Source: https://livingspinal.com/

-- NOT A SQL CHANGE. Military Racquetball Federation (CA), id 2b073e5c-f96d-4e15-a8e1-990fb01d7f8f: ok: Racquetball only (no matching key). Source: https://www.usaracquetball.com/military-racquetball

-- NOT A SQL CHANGE. Rancho Simi Recreation and Park District Alternative Recreation — Tuesday Bowling (CA), id 5358743c-cefa-4394-825b-33c23a1a1826: ok: Bowling, walking, art, dances; seasonal leagues not named. Source: https://www.rsrpd.org/recreation/alternative_recreation.php

-- NOT A SQL CHANGE. Sharp Rehabilitation Center Recreation Therapy Department (CA), id 489c09ab-d5e5-486f-8387-7dda320daf0e: unclear: Hospital rehab page mentions a recreation therapy sports program but names no sports. Source: https://www.sharp.com/services/physical-rehabilitation

-- NOT A SQL CHANGE. SoCal Soaring Academy (CA), id cf84e69f-14ed-432b-8833-b6f5f0755ba7: ok: Glider flight school with monthly veteran soaring days; no matching sport. Source: http://www.soaringacademy.org/

-- NOT A SQL CHANGE. Special Olympics Northern California — 2026 Bowling Butte (CA), id 669906a8-32b6-4ffd-8bf9-677b11fd9256: ok: Bowling only (fall practices Sep-Oct 2026). Source: https://sonc.org/events-calendar/2026-bowling-butte/

-- NOT A SQL CHANGE. Special Olympics Northern California — 2026 Bowling Del Norte (CA), id c3620b33-8d76-4ebb-9071-1a9c587ada7e: ok: Bowling only; page rate-limited, not read directly. Source: https://sonc.org/events-calendar/2026-bowling-del-norte/

-- NOT A SQL CHANGE. Special Olympics Northern California — 2026 Bowling Humboldt (CA), id 5762f60e-99ce-445c-9113-138d6084ab91: ok: Bowling only; page rate-limited, not read directly. Source: https://sonc.org/events-calendar/2026-bowling-humboldt-2/

-- NOT A SQL CHANGE. Special Olympics Northern California — Tulare County Bowling (CA), id 85cc22c5-b996-476d-9401-9d1b418460d7: ok: Bowling only; page rate-limited, not read directly. Source: https://sonc.org/events-calendar/2026-bowling-tulare-county/

-- NOT A SQL CHANGE. Special Olympics Northern California — Yolo Untouchables Bowling (CA), id a2a60316-e7d2-4553-81e9-af9ca8c1681f: ok: Bowling only; page rate-limited, not read directly. Source: https://sonc.org/events-calendar/2026-bowling-yolo-untouchables/

-- NOT A SQL CHANGE. 5280 Challenge Games (CO), id cd980fdb-6d0b-4c56-a34a-77edc7a29a53: closed: Annual track and archery meet; site says it was not held, last results 2021, nothing since 2022. Source: https://5280challenge.wixsite.com/5280challenge

-- NOT A SQL CHANGE. Adaptive Sports USA (CO), id e9c6e875-44fd-4b28-90cd-f4fe5b7a3fd7: closed: Adaptive Sports USA merged into Move United; this URL is the Adaptive Sports Center Crested Butte site (same as previous row). Source: http://www.adaptivesports.org

-- NOT A SQL CHANGE. Denver Adaptive Divers (CO), id d4e94d4e-075f-5024-97b6-a411534111b9: ok: adaptive scuba only; no matching sport key. Given URL is the Move United listing, not the org's own site. Source: https://moveunitedsport.org/organization/denver-adaptive-divers/

-- NOT A SQL CHANGE. NeuAbility (CO), id c257a668-ca6e-58a6-81b7-10ebf31cad31: ok: fitness/cross-training and wellness only; no matching sport key. Given URL is the Move United listing. Source: https://moveunitedsport.org/organization/neuability/

-- NOT A SQL CHANGE. No Barriers USA (CO), id aef1d263-8ff3-59b1-8e58-6251d0cc07cb: ok: own site programs page names no sports; Move United listing mentions backpacking, hiking, paddle boarding, yoga. Mostly expedition/mindset programs. Source: https://www.nobarriersusa.org/programs/

-- NOT A SQL CHANGE. USA Field Hockey (CO), id 80f94503-2a52-519d-b473-dc7540321dd9: ok: field hockey (All Starz) only; no matching sport key. Given URL is the Move United listing. Source: https://moveunitedsport.org/organization/united-states-field-hockey-association/

-- NOT A SQL CHANGE. Nemours/Alfred I duPont Hospital for Children – Paralympic Sport Delaware (DE), id e036ec93-985e-43b2-bef1-8dc7ff0ede1f: unclear: URL redirects to a general hospital page; no Paralympic sport or adaptive sports program listed. Source: https://www.nemours.org/locations/wilmington-ai-dupont-childrens-hospital.html

-- NOT A SQL CHANGE. Irish Water Dogs Warriors (FL), id 5a2a72d3-7add-4bd4-bd03-21f3c8581424: unclear: Facebook only (login wall); only 2013 press found (veteran kayaking/fishing outings); current activity unknown. Source: https://www.facebook.com/IRISHWATERDOGSWARRIORS/

-- NOT A SQL CHANGE. Team River Runner Orlando (FL), id fe2e3a5a-bae3-4bad-9237-4907422d96e6: closed: Orlando chapter not in Team River Runner's current chapter list; old URL lands on homepage. Source: https://www.teamriverrunner.org/get-involved/chapters/

-- NOT A SQL CHANGE. Team River Runner Tampa (FL), id ac1a8f01-a509-4c5b-8874-6c289f9d49ea: closed: Tampa chapter not in Team River Runner's current chapter list; old URL lands on homepage. Source: https://www.teamriverrunner.org/get-involved/chapters/

-- NOT A SQL CHANGE. Wheelchair Sports and Recreation Association (FL), id 353fde71-5827-4e54-8244-7e6bc268783e: dead: domain shows only an ad-parking page; no content. Source: http://www.wheelchairsportsandrecreation.com/

-- NOT A SQL CHANGE. Athens-Clarke County Therapeutic Recreation (GA), id cb47f9be-4091-5640-bd88-e5d1396925c3: ok: adaptive programs page lists only Special Olympics bowling. Source: https://www.accgov.com/8371/Adaptive-Programs

-- NOT A SQL CHANGE. Atlanta VA Medical Center (GA), id dab425ea-747f-4f11-97e1-8bdffb10333a: ok: VA health-care homepage; lists no adaptive sports program of its own. Source: https://www.va.gov/atlanta-health-care/

-- NOT A SQL CHANGE. Charlie Norwood VA Medical Center (GA), id 0b35baa7-31b6-4ed3-9d39-9d8ad95160fb: ok: VA health-care homepage; lists no adaptive sports program of its own (one adaptive cornhole event story). Source: https://www.va.gov/augusta-health-care/

-- NOT A SQL CHANGE. Cobb PARKS Therapeutic Recreation Services (GA), id bb0ff850-4aa4-5a1d-a748-bbe49f64ded6: ok: says 19 Special Olympics sports offered but does not name them (bowling mentioned). Source: https://www.cobbcounty.gov/parks/programs/therapeutic-recreation-services

-- NOT A SQL CHANGE. Team River Runner Augusta (GA), id 128ccf3a-ad81-4989-a71a-70cb1857c3fc: closed: Augusta chapter not in Team River Runner's current chapter list; old URL lands on homepage. Source: https://www.teamriverrunner.org/get-involved/chapters/

-- NOT A SQL CHANGE. Iowa City VA Health Care System (IA), id 75895911-0078-4349-b388-59a8d06eb740: ok: VA health-care homepage; lists no adaptive sports program of its own. Source: https://www.va.gov/iowa-city-health-care/

-- NOT A SQL CHANGE. SportAbility of Iowa – Eastern Iowa (IA), id 0b8f66df-b7a9-45e2-b962-27dcec706cf1: unclear: Facebook only (login wall); GuideStar says it dropped off the IRS master file and may have closed or merged; last known program was wheelchair basketball. Source: https://www.facebook.com/sportabilityofiowa/

-- NOT A SQL CHANGE. VA Central Iowa Health Care System (IA), id 98eb294f-c1f8-4fa8-930c-88a9aeae7a7f: ok: VA health-care homepage; lists no adaptive sports program of its own. Source: https://www.va.gov/central-iowa-health-care/

-- NOT A SQL CHANGE. Edward Hines Jr. VA Medical Center (IL), id 4c9b0784-799e-424c-b801-3a471f91ffd5: ok: VA health-care homepage; lists no adaptive sports program of its own (GLASA runs clinics there). Source: https://www.va.gov/hines-health-care/

-- NOT A SQL CHANGE. Jesse Brown VA Hospital (IL), id e981128b-0479-4bf7-8d17-58383a3efbb0: ok: VA health-care homepage; lists no adaptive sports program of its own. Source: https://www.va.gov/chicago-health-care/locations/jesse-brown-department-of-veterans-affairs-medical-center/

-- NOT A SQL CHANGE. Northern Indiana VA Health Care System (IN), id 48971bd6-73cb-459d-b0c2-95370f100b50: unclear: VA facility homepage; no adaptive sports program named.. Source: https://www.va.gov/northern-indiana-health-care/

-- NOT A SQL CHANGE. Team River Runner – Northwest Indiana (IN), id 297ac414-81c3-4cf1-b273-4411bf4cbedb: closed: Team River Runner chapter list has no Northwest Indiana chapter; old URL now goes to the national homepage.. Source: https://www.teamriverrunner.org/get-involved/chapters/

-- NOT A SQL CHANGE. Shawnee County Parks & Recreation (KS), id b7d2db61-1953-4cdd-a3c3-ae822185b06d: unclear: Has an Adaptive Recreation category in its registration catalog, but no specific sports named on pages read.. Source: https://parks.snco.us/318/Programs-Sports

-- NOT A SQL CHANGE. Frazier Rehabilitation Hospital – Louisville (KY), id afe1021c-0e26-420a-bf1c-b8a2ead8ca6c: unclear: Hospital location page names no adapted sports program.. Source: https://uoflhealth.org/locations/frazier-rehabilitation-institute/

-- NOT A SQL CHANGE. Independence Place (KY), id 4d6d31c8-7d4d-457a-9c13-f68d74e8f58f: closed: Own site returns an empty page; the Lexington office now appears as 'Independence Place at CAL' (Center for Accessible Living), so it looks merged.. Source: https://www.calky.org/lexington-ky

-- NOT A SQL CHANGE. Independence Place at Center for Accessible Living (KY), id fc2a4ac1-83df-5d55-91da-c2a128007358: unclear: Independent-living office page; services are employment, housing, advocacy. No sports named.. Source: https://www.calky.org/lexington-ky

-- NOT A SQL CHANGE. Kentucky Department of Fish and Wildlife Resources Disability Access (KY), id 7e4c906b-7de8-581d-af90-1ea6910931cb: ok: State hunting method exemptions for people with disabilities; not a sports program.. Source: https://fw.ky.gov/Licenses/Pages/Hunting-Method-Exemptions.aspx

-- NOT A SQL CHANGE. Project Healing Waters Louisville (KY), id db6fdd78-ad79-43ff-ac4e-29f8000ca71e: ok: Fly fishing for veterans only (no key).. Source: https://projecthealingwaters.org/location/louisville/

-- NOT A SQL CHANGE. Spina Bifida Association of Kentucky Adaptive Sports Activities (KY), id d5cbf21f-0df2-58fa-9c6a-338c5e804b73: ok: Lists other organizations only; runs no sports itself. Given /activities URL is 404.. Source: https://spinabifidakentucky.org/adaptive-sport%2Factivities

-- NOT A SQL CHANGE. Amelia Park Ice Arena (MA), id 7ec6c489-70fd-4e5a-8b63-fb97006f6595: unclear: Ice arena homepage; no adaptive program named.. Source: https://www.ameliaparkarena.org/

-- NOT A SQL CHANGE. CAPEable Adventures – Cape Cod (MA), id 13151eb1-e11f-4648-8913-9d4a03cfd2e1: hijacked: Domain now an Australian travel blog.. Source: http://www.capeableadventures.org

-- NOT A SQL CHANGE. Team River Runner – Boston (MA), id 3df9a7ec-870c-4d4c-960f-622d2435aa34: closed: No Boston chapter on Team River Runner's list (Massachusetts has only Charlemont).. Source: https://www.teamriverrunner.org/get-involved/chapters/

-- NOT A SQL CHANGE. VA Boston Health Care System (MA), id bc799c8e-968e-44be-8d56-5b3c608389fe: unclear: VA facility homepage; no adaptive sports program named.. Source: https://www.va.gov/boston-health-care/

-- NOT A SQL CHANGE. Catch A Lift Fund (MD), id ecda2e7a-a2a4-41ef-b49c-6ad3de0ae158: ok: Fitness grants and gym/wellness support for combat-injured veterans; no sports program.. Source: https://catchaliftfund.org/

-- NOT A SQL CHANGE. Maryland Public Secondary Schools Athletic Association - Adapted and Unified Sports (MD), id ccb95c96-69c7-593c-8ae6-dd205b9d4842: unclear: State school athletics association; site shows standard sports, no adapted program found. Maryland adapted/corollary sports are run by school districts.. Source: https://www.mpssaa.org/

-- NOT A SQL CHANGE. Team River Runner – Ft. Meade (MD), id 0d19ab48-9ff6-4815-ab18-f7f46db3b9e3: closed: No Ft. Meade chapter on Team River Runner's list (Maryland: Walter Reed, Perry Point, Southern Maryland).. Source: https://www.teamriverrunner.org/get-involved/chapters/

-- NOT A SQL CHANGE. Aleda E. Lutz VA Medical Center (MI), id 23d03226-b5b4-4227-8654-a8e2d2cf3d25: unclear: VA facility homepage; no adaptive sports program named.. Source: https://www.va.gov/saginaw-health-care/

-- NOT A SQL CHANGE. John D. Dingell VA Medical Center (MI), id 1e2cee17-2cda-4bde-ad38-9655733ee409: unclear: VA facility homepage; no adaptive sports program named.. Source: https://www.va.gov/detroit-health-care/

-- NOT A SQL CHANGE. Lucky Fin Project (MI), id c1256dcd-2be9-4ff6-ba4f-992f04b59120: ok: Limb-difference family support network; no sports program.. Source: https://luckyfinproject.org/

-- NOT A SQL CHANGE. Oakland County Parks – Waterford (MI), id 2a18f3cb-4cec-408b-8a69-111d0a43089c: ok: Mostly inclusion services and social events; sponsor list mentions a sit ski and handcycles but no scheduled sports programs.. Source: https://www.oaklandcountymi.gov/community/oakland-county-parks/recreation/adaptive-recreation/

-- NOT A SQL CHANGE. EA Therapeutics (MN), id a92000c8-82be-4911-b739-f413b4de0122: ok: Youth adaptive fitness and play sessions at a physical therapy clinic; no specific sports.. Source: https://chooseea.org/community-youth-specialized-program-adaptive-fitness-for-all-abilities-ea-therapeutic-health

-- NOT A SQL CHANGE. Minneapolis VA Health Care System (MN), id 6b3a925f-120d-4460-8471-a4eebfe0eec3: unclear: VA health system homepage; the given page describes no adaptive sports program. Source: https://www.va.gov/minneapolis-health-care/

-- NOT A SQL CHANGE. St. Cloud VA Health Care System (MN), id 086dc190-7e6e-4e27-bcee-bb8016713563: unclear: VA health system homepage; the given page describes no adaptive sports program. Source: https://www.va.gov/st-cloud-health-care/

-- NOT A SQL CHANGE. Unite 2 Fight Paralysis (MN), id 255ef72e-1313-4225-afed-632fd5d4d9e0: unclear: Spinal cord injury cure advocacy and research org; site lists no sports programs. Source: https://u2fp.org

-- NOT A SQL CHANGE. G.V. Sonny Montgomery VAMC Warriors Unlimited (MS), id 5ef8921e-1426-48ff-a03b-960dd76c9ac3: unclear: VA medical center page; no Warriors Unlimited or adaptive sports program found. Source: https://www.va.gov/jackson-health-care/locations/gv-sonny-montgomery-department-of-veterans-affairs-medical-center/

-- NOT A SQL CHANGE. Metro Area Community Empowerment (MACE) (MS), id 22aa5057-d491-4ab6-81ef-bffb9d105734: unclear: Site is an empty WordPress shell: no posts, no events, no program info. Source: https://mace-mississippi.org/

-- NOT A SQL CHANGE. Oxford Park Commission League of Champions (MS), id 8d57f6cd-a73b-4618-91a9-b6a667212fdd: unclear: Program page says free year-round activities but names no sports. Source: https://www.oxfordparkcommission.com/Default.aspx?tabid=1348176

-- NOT A SQL CHANGE. University of Southern Mississippi Technology Learning Center (MS), id 93b0cd0b-d4b1-48b9-bdf0-ebdfadee8de0: unclear: University disability studies institute; page lists no sports program (old Technology Learning Center listing). Source: https://www.usm.edu/ids/index.php

-- NOT A SQL CHANGE. Moving Forward Adaptive Sports (MT), id c1fa9d32-2a99-4e4c-b563-81b2b3643876: dead: Domain shows an empty server directory index / under construction page. Source: http://neverstoprocking.com

-- NOT A SQL CHANGE. Mecklenburg County Park & Rec – Therapeutic (NC), id 6b5f8dad-6515-431b-b77a-763cc71babbb: unclear: Therapeutic recreation page names no sports; program list is in a script-loaded registration system. Source: https://parkandrec.mecknc.gov/Activities/therapeutic-recreation-activities

-- NOT A SQL CHANGE. The Warrior Ride (NC), id 9b579336-a92d-4a4e-a3fe-d9219008cfcd: unclear: Site looks stale: latest news 2016, no upcoming events, template placeholders. Source: https://www.thewarriorride.org/

-- NOT A SQL CHANGE. Fargo VA Health Care System (ND), id a71b6ba6-ec39-4750-8be7-5f98bf90194f: unclear: VA health system homepage; the given page describes no adaptive sports program. Source: https://www.va.gov/fargo-health-care/

-- NOT A SQL CHANGE. Alegent Health Immanuel Rehabilitation Center – Omaha (NE), id 55d525cf-a4ee-44dd-8f24-c697d0fb9cd2: closed: Alegent Health is now CHI Health; this is the inpatient therapeutic recreation page, likely a duplicate of the CHI Health Immanuel listing. Source: https://www.chihealth.com/services/rehabilitation/inpatient-rehabilitation/immanuel-rehabilitation-institute/therapeutic-recreation

-- NOT A SQL CHANGE. Eastern Nebraska Wheelchair Athletic Association (ENWAA) (NE), id 134c58e2-9d11-4d0b-9bcc-8348c869b44c: unclear: Third-party directory page about a summer camp; the org's own sites (enwaa.org, enwaa.com) do not load; camp now appears run by CHI Health. Source: https://cpfamilynetwork.org/resources/resources-guide/eastern-nebraska-wheelchair-athletic-association-enwaa/

-- NOT A SQL CHANGE. Nebraska-Western Iowa VA Health Care System (NE), id 3f4d5d30-7282-4fbf-b464-b33ac48dacb7: unclear: VA health system homepage; the given page describes no adaptive sports program. Source: https://www.va.gov/nebraska-western-iowa-health-care/

-- NOT A SQL CHANGE. New Jersey Freeze (NJ), id 1c478649-30f8-4b3c-96fd-72b09ecc157d: dead: Domain redirects to a parked lander page. Source: http://www.newjerseyfreeze.com

-- NOT A SQL CHANGE. Push to Walk (NJ), id 9b6317b0-a99f-5958-97f4-e5919cd13079: ok: Adaptive gym and activity-based training for paralysis; no sports in the key list. Source: https://www.pushtowalknj.org/

-- NOT A SQL CHANGE. Center of Recreational Excellence CORE (NM), id 32bbf405-1eaa-4ce4-a9b7-d8662584eae5: unclear: City recreation center; sports page shows general youth/adult programs with no adaptive sports program. Source: https://corehobbs.com/sports.html

-- NOT A SQL CHANGE. NMVAHCS (NM), id 30ab9f3c-6731-4d3e-908e-95391e1263e6: unclear: VA health system homepage; the given page describes no adaptive sports program. Source: https://www.va.gov/new-mexico-health-care/

-- NOT A SQL CHANGE. Not Forgotten Outreach (NM), id c882ab96-5ecd-4fdb-af5d-f4a74258d2f0: ok: Veterans farm; homepage mentions recreation but names no sports. Source: https://www.notforgottenoutreach.org/

-- NOT A SQL CHANGE. DRIVEN NeuroRecovery Center (NV), id d4ea78c9-520c-4fc3-ab72-b9aecdcc1d82: ok: Neurorecovery and adaptive fitness centers; no sports in the key list. Source: https://drivenneuro.org/

-- NOT A SQL CHANGE. House of Champions Foundation Inc. (NV), id a605fd10-d2b5-5b11-aafe-fab5e5a403b8: ok: Funds adaptive CrossFit/fitness athletes; no sports in the key list. Source: https://www.hocfoundation.org/

-- NOT A SQL CHANGE. Cape Ability Outrigger Ohana (NY), id 83c4022d-d774-4ddb-b9c0-1d97cdf716d9: hijacked: Domain now hosts an unrelated kayaking/betting content blog. Source: http://www.adaptivecanoeing.org

-- NOT A SQL CHANGE. NYC Parks & Recreation (NY), id 77f5ec7b-65d0-48c4-947e-4a24fa0da440: unclear: Page only describes a one-off 2011 clinic (track, archery, weightlifting); no current program shown. Source: https://www.nycgovparks.org/accessibility/accessibility-programs/paralympics

-- NOT A SQL CHANGE. National Recreation Education Foundation (NY), id a805a931-8861-4ccd-bbd5-b3287f98d25a: unclear: Generic recreation-education site, no adaptive programs or sports listed. Source: https://recreationeducation.org/

-- NOT A SQL CHANGE. Northport VAMC / DAV (NY), id 9322c871-61f2-41be-9061-0a96ebd9a8d2: unclear: General VA health system page; no adaptive sports program listed. Source: https://www.va.gov/northport-health-care/

-- NOT A SQL CHANGE. Cincinnati VA Medical Center (OH), id 8929dc63-aecd-4e38-9e69-9753bee64c24: unclear: General VA health system page; no adaptive sports program listed. Source: https://www.va.gov/cincinnati-health-care/

-- NOT A SQL CHANGE. SPIRE Institute (OH), id 2ec2b541-100a-4bb7-a341-cff2b0c37276: unclear: Elite boarding sports academy; site shows no adaptive or para program. Source: https://www.spireacademy.com/

-- NOT A SQL CHANGE. Ultimate Workout & Recovery (OH), id 9864aaf4-6756-4ca4-9ca2-39558c80efea: unclear: Rehab/exercise equipment seller, not a sports program. Source: https://workoutandrecovery.com/

-- NOT A SQL CHANGE. Oklahoma City VA Medical Center (OK), id 98d9e11c-58c3-422f-9b1c-1ab6e3d4be99: unclear: General VA medical center page; no adaptive sports program listed. Source: https://www.va.gov/oklahoma-city-health-care/locations/oklahoma-city-va-medical-center/

-- NOT A SQL CHANGE. Tulsa Jammers (OK), id 4213e003-953d-45d2-b6ff-4424fcbba2cf: unclear: Listed site is a Facebook page (login wall); NWBA shows a junior wheelchair basketball team but last season record found is 2017-18. Source: https://www.nwba.org/page/show/3533081-tulsa-jammers

-- NOT A SQL CHANGE. HOPE Network – Pittsburgh (PA), id 24988bae-93c1-433c-8bbf-6d68bc4cbfac: unclear: Only a Facebook page (login wall); no own website to verify current programs. Source: https://www.facebook.com/HOPENetworkPA/

-- NOT A SQL CHANGE. PUCHOG, Inc. (PA), id 0b9d96fb-aaca-42f2-9150-05e9afc516d3: unclear: Ice hockey for wounded veterans (no matching key, not sled hockey); site footer dated 2019, may be stale. Source: https://www.puchog.org/

-- NOT A SQL CHANGE. Beach Cowboy Fitness Foundation (SC), id 87451442-33d9-52fe-b816-69566fd5fa11: ok: Adaptive fitness training and social outings (bowling, dolphin cruises); no matching sport. Source: https://beachcowboyfitnessfoundation.org/

-- NOT A SQL CHANGE. South Carolina Department of Natural Resources - Disability Access (SC), id c45acb41-a629-58d1-b339-4a0ab468d830: ok: Disability access to hunting and fishing only; no matching sport. Source: https://www.dnr.sc.gov/accommodation.html

-- NOT A SQL CHANGE. Touch the Future, Inc. – Golden Corner (SC), id 4a7b9e59-e304-48af-b13c-59d5b8990aa8: unclear: Paralympic sports club page says only 'COMING SOON'. Source: https://touchthefuture.us/events/paralympic-sports-club-events/

-- NOT A SQL CHANGE. Sioux Falls VA Health Care System (SD), id fb013434-cef2-4600-8e01-e0ae83d05823: unclear: General VA health system page; no adaptive sports program listed. Source: https://www.va.gov/sioux-falls-health-care/

-- NOT A SQL CHANGE. VA Black Hills Health Care System (SD), id 2bd48130-c315-4c13-993b-0ff5bed06199: unclear: General VA health system page; no adaptive sports program listed. Source: https://www.va.gov/black-hills-health-care/

-- NOT A SQL CHANGE. City of Chattanooga, Parks & Recreation – Therapeutic Recreation (TN), id d84918a6-4305-472a-9c79-22e91e7cb954: ok: Therapeutic recreation page names no specific sports. Source: https://chattanooga.gov/things-to-do/athletic-therapeutic/therapeutic-recreation

-- NOT A SQL CHANGE. Project Healing Waters Knoxville (TN), id 8bd8d9f5-fb88-4a0b-99de-70dd531e5950: ok: Fly fishing for veterans; no matching sport. Source: https://projecthealingwaters.org/location/knoxville/

-- NOT A SQL CHANGE. University of Tennessee Adaptive Recreation Club (TN), id 6e7b12d3-fa64-5799-9c35-0c8d3d4de6c6: unclear: Student club page names no sports and shows no upcoming events. Source: https://utk.campuslabs.com/engage/organization/adaptiverec

-- NOT A SQL CHANGE. Ability Skateboarding & Action Sports (TX), id ae7d4727-b060-467b-a470-9d0cd22c7317: ok: Adaptive skateboarding and WCMX only; no matching key. Source: https://abilityskateboarding.org/

-- NOT A SQL CHANGE. City of Lake Jackson Parks & Recreation (TX), id 956cc279-f0a6-4038-8b75-dfa81eb59003: ok: City site; only adaptive item found is an Easter egg hunt. Source: https://www.lakejackson-tx.gov/

-- NOT A SQL CHANGE. Dallas Jr. Wheelchair Mavericks (TX), id 23e3f33a-1296-44e1-8517-e242c7dcadab: unclear: Facebook page only, unreadable without login; name indicates junior wheelchair basketball. Source: https://www.facebook.com/DallasJrMavs/

-- NOT A SQL CHANGE. Harker Heights Parks & Recreation (TX), id 938434c2-34ae-4c49-9af0-752eb2e8eae4: unclear: General city parks page; no adaptive program or sports listed. Source: https://www.harkerheights.gov/388/Parks-Recreation

-- NOT A SQL CHANGE. Michael E. DeBakey VA Medical Center (TX), id 904cfcdf-6164-4f25-9f33-adddcd6360d1: unclear: General VA medical center homepage; no adaptive sports program listed. Source: https://www.va.gov/houston-health-care/

-- NOT A SQL CHANGE. TIRR Texans (TX), id fbb0cdfe-4492-4a43-bc8d-61413bdba719: unclear: Given tirr.memorialhermann.org URL does not resolve; TIRR Texans appear to be the TIRR Adapted Sports program, likely a duplicate of the TIRR Memorial Hermann Sports listing. Source: https://memorialhermann.org/services/specialties/tirr/patients-visitors/adaptive-sports

-- NOT A SQL CHANGE. Victoria Bad News Chairs (TX), id c05dd46e-9edf-49a8-b58f-16792af8ccd7: unclear: Facebook group only, unreadable; a July 2026 local news story describes it as a wheelchair softball team. Source: https://victoriaadvocate.com/2026/07/19/local-wheelchair-softball-team-finds-community-in-annual-tournament/

-- NOT A SQL CHANGE. Utah Wheelin’ Jazz (UT), id 55ad07d6-5c9d-4c42-9038-76b9b977bad6: unclear: Facebook page only, unreadable; name indicates wheelchair basketball team. Source: https://www.facebook.com/wheelinjazz/

-- NOT A SQL CHANGE. Hunter Holmes McGuire VA Medical Center (VA), id 0740facb-22fe-4842-923a-53987e4715d0: unclear: General VA medical center homepage; no adaptive sports program listed. Source: https://www.va.gov/richmond-health-care/

-- NOT A SQL CHANGE. Patriots for Disabled Divers (VA), id 15dc9565-45bb-41c3-b887-c76fad9b1678: ok: Adaptive scuba diving only; no matching sport key. Source: https://www.patriotsfordisableddivers.org/

-- NOT A SQL CHANGE. Project Enduring Pride (VA), id bcacd676-870d-4cdc-a89c-e9bcd6844bc2: dead: Website suspended page. Source: http://www.enduringpride.org

-- NOT A SQL CHANGE. Team River Runner – Blue Ridge / Shenandoah (VA), id 8b87f689-0e98-4b65-a78a-48c2bc63bf0b: unclear: Old chapter URL now redirects to the national Team River Runner homepage; no Blue Ridge/Shenandoah chapter page found. Source: http://www.teamriverrunner.org/?q=node/1285

-- NOT A SQL CHANGE. Virginia Adaptive Sports / Sports Club Finder (VA), id 1eb3ede1-ae01-5e49-be7a-f9e47f63163f: unclear: This is the VA Sports Club Finder directory page, not an organization. Source: https://www.va.gov/adaptivesports/va_clubfinder.asp

-- NOT A SQL CHANGE. Wounded Warrior Adaptive Sports (VA), id 4496c3b4-4511-4a92-b30c-40006a38027d: unclear: Facebook page only, unreadable. Source: https://www.facebook.com/WoundedWarriorAdaptiveSports

-- NOT A SQL CHANGE. Team St. Luke’s – Spokane (WA), id 74e18e79-17c6-4c79-921f-cdc9feff816f: unclear: General Providence St. Luke's rehab hospital page; no Team St. Luke's or adaptive sports program found. Source: https://www.providence.org/locations/wa/st-lukes?id=436&linkidentifier=id&itemid=436

-- NOT A SQL CHANGE. Clement Zablocki VA Medical Center (WI), id d1c929db-6ba9-4462-8764-2c7c5faf7f7f: unclear: General VA medical center homepage; no adaptive sports program listed. Source: https://www.va.gov/milwaukee-health-care/

-- NOT A SQL CHANGE. Paralyzed Veterans of America Wisconsin Chapter | PVA (WI), id 10b9a884-25ad-4f28-b7d1-b162c4bb563b: unclear: Chapter site's sports pages only point to national VA/PVA events and partner orgs; no chapter-run sports named. Source: https://wisconsinpva.org/

-- NOT A SQL CHANGE. National Center on Health, Physical Activity and Disability (NCHPAD) (no state), id b936102a-0392-46c6-a810-c8d71569aecb: unclear: National resource and research center; does not run sports programs. Source: https://www.nchpad.org/

-- NOT A SQL CHANGE. Salvage Life (no state), id da30ccb9-ac5a-4389-9781-041019c57101: unclear: Site menu names Carolina Wheelchair Football; AdaptVI clinics are occasional; latest news says 'coming soon' (2025). Source: https://www.salvagelifevi.org/
