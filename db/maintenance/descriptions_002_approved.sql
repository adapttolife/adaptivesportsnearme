-- docs/data-fixes/descriptions-approved.md. Approved by Alec on 2026-10-21 (315 drafts, read back unchanged from the review docs).
-- Fills a description only where none exists, so it is safe to run twice and never replaces someone else's text.

-- Adaptive Sports at Mount Snow | ASMS
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; bi skiing; Special Olympics ski team. Athletes served: People of all ages with physical, cognitive and sensory disabilities, including students with disabilities through school programs.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '34380ebf-bf06-4de7-800f-d4f4a60d6d0b' AND (description IS NULL OR description = '');

-- Adaptive Sports Foundation
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding; ski and snowboard racing; skateboarding; kayaking; canoeing; paddle boarding; swimming; mountain biking; hiking; soccer; basketball; golf; virtual fitness classes. Athletes served: Children and adults with physical and cognitive disabilities and chronic illnesses, ages 5 and up for ski lessons, including people with autism, amputations, cerebral palsy, paralysis and traumatic brain injury.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '90485a4a-7a41-45b9-8d59-ede3ac7e3cae' AND (description IS NULL OR description = '');

-- Black Hills Regional Ski for Light, Inc.
UPDATE organizations SET description = 'Sports and activities: Cross country skiing; downhill skiing; snowshoeing; snowmobiling; cycling; canoeing; kayaking; boating; fishing; hiking. Athletes served: People of all ages who are blind or have low vision or who have mobility disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '728c099c-a7d8-4d8d-ac11-3ee14ab6b071' AND (description IS NULL OR description = '');

-- Blue Ridge Adaptive Snow Sports (BRASS)
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding; ski biking. Athletes served: People of all ages with disabilities, including mobility, cognitive, vision and hearing disabilities, autism, Down syndrome, cerebral palsy, spinal cord injury, multiple sclerosis and amputation.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '84a1a725-593d-49e1-9b5d-7c2b46373cd8' AND (description IS NULL OR description = '');

-- Boise Adaptive Snowsport Education | BASE
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding. Athletes served: People with physical or cognitive disabilities who need adaptive instruction to ski or snowboard.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f991223c-e3af-4148-a918-5f09e0b19c88' AND (description IS NULL OR description = '');

-- Cannonsburg Challenged Ski Association
UPDATE organizations SET description = 'Sports and activities: Downhill skiing; mono skiing; bi skiing. Athletes served: People ages 6 and older with physical, developmental and learning disabilities, including people who are deaf, hard of hearing, blind or have low vision, and people with paraplegia, quadriplegia or high level amputations.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'adbc8084-0adf-45d6-81a0-4232ed6779b8' AND (description IS NULL OR description = '');

-- Central Cross Country Ski Association – Madison
UPDATE organizations SET description = 'Sports and activities: Cross country skiing; sit skiing; ski racing; biathlon; target shooting; strength training. Athletes served: Youth and adults with physical disabilities or visual impairments, children with disabilities at introductory clinics, race athletes ages 20 and under, and veterans and service members with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9d37cd88-0261-4f84-9f1b-a9698acee719' AND (description IS NULL OR description = '');

-- Challenge Aspen
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; snowshoeing; ice skating; tubing; dogsledding; stand up paddleboarding; cycling; mountain biking; hiking; camping; ropes course; fishing; archery; horseback riding; sailing; whitewater rafting; swimming; bowling; music and dance camp. Athletes served: People of all ages with cognitive or physical disabilities, and veterans and active duty service members with service connected disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f28a3bb7-6e25-42b0-90af-db583ffd0673' AND (description IS NULL OR description = '');

-- Eagle Mount Billings
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; cross country skiing; snowshoeing; climbing; cycling; golf; horsemanship; group fitness; summer day camps. Athletes served: Children and adults with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'feb18991-7382-4f49-bcac-dc84b26f0582' AND (description IS NULL OR description = '');

-- Eagle Mount Bozeman
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; cross country skiing; snowshoeing; ice skating; cycling; mountain biking; climbing; hiking; rafting; kayaking; fishing; horseback riding; swimming; arts; horticulture. Athletes served: Children, youth and adults with physical, developmental, cognitive or sensory disabilities, young people with cancer, and veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c7cccde6-1b05-46d5-9f80-ce501f45799a' AND (description IS NULL OR description = '');

-- Eagle Mount Great Falls
UPDATE organizations SET description = 'Sports and activities: Skiing; snowboarding; horseback riding; equine assisted learning; animal activities; paddle sports; sled hockey. Athletes served: Children and adults with physical, developmental, behavioral or mental disabilities, plus inclusive toddler activities for ages 1 to 5.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dad64d2f-9967-4c69-b3cf-e2b46e138dc4' AND (description IS NULL OR description = '');

-- Foresight Ski Guides, Inc.
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; hiking; stand up paddleboarding; kayaking; swimming; rafting; horseback riding; rock climbing. Athletes served: Youth and adults who are legally blind or have low vision, with a summer camp for youth ages 10 to 21.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ad159233-f344-4ec6-b937-2a3057547716' AND (description IS NULL OR description = '');

-- Greek Peak Adaptive Snowsports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; mono skiing; bi skiing. Athletes served: People ages 6 and up with disabilities, including people with hearing or vision loss, amputations, developmental disabilities, autism, cerebral palsy and partial paralysis.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cb639492-5bd8-49a5-97c5-a1f8f71fbb4b' AND (description IS NULL OR description = '');

-- Leaps Of Faith Disabled Skiers – Paralympic Sport Connecticut
UPDATE organizations SET description = 'Sports and activities: Water skiing; wakeboarding; tubing; downhill skiing; sit skiing; snowboarding. Athletes served: Children, adults and veterans with disabilities, of all ages and abilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '37759c33-9686-477f-8aab-c4be9e49e553' AND (description IS NULL OR description = '');

-- National Ability Center – Park City
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; ski racing; Nordic skiing; snowshoeing; sled hockey; fat tire biking; cycling; mountain biking; climbing; challenge course; archery; horseback riding; kayaking; canoeing; paddle boarding; water skiing; wakeboarding; wake surfing; whitewater rafting; golf; pickleball; camps. Athletes served: Youth and adults with physical, cognitive and developmental disabilities, people with mental health diagnoses or neurodiversity, and veterans and service members, along with their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7f66bd7e-f782-4908-be5d-0d9317f35d37' AND (description IS NULL OR description = '');

-- New England Disabled Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; snowshoeing; cycling; mountain biking; golf; kayaking; stand up paddleboarding; pickleball. Athletes served: Children and adults ages 4 and up with physical, cognitive, hearing or visual disabilities, including autism, cerebral palsy, Down syndrome, spinal cord injury, traumatic brain injury and amputation, and veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd2c13bb9-edc8-412e-845e-730e8fe50bb4' AND (description IS NULL OR description = '');

-- New England Healing Sports Association (NEHSA)
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding; ski biking; kayaking; paddle boarding; hiking. Athletes served: People of all ages with physical and cognitive disabilities, including people with amputations, stroke, cerebral palsy, spina bifida, multiple sclerosis, paralysis, vision or hearing loss and developmental disabilities, and veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8f21c7f6-8403-4792-978e-a83899d83921' AND (description IS NULL OR description = '');

-- Special Outdoor Leisure Opportunities (SOLO, Inc.)
UPDATE organizations SET description = 'Sports and activities: Downhill skiing; cross country skiing; snowshoeing; hiking. Athletes served: Children ages 8 and up and adults who can walk, including people who use crutches, with physical, visual, hearing or significant mental impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7e35c388-e29d-4429-bc56-3c684db25179' AND (description IS NULL OR description = '');

-- Steamboat Adaptive Recreational Sports ‘STARS’
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; Nordic skiing; snowboarding; snowshoeing; cycling; hiking; kayaking; swimming. Athletes served: People of all ages with physical and cognitive disabilities and their families, including skiers who are blind or have low vision, and veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '91660598-fbb3-4f51-9400-d15b743d5a02' AND (description IS NULL OR description = '');

-- Two Top Mountain Adaptive Sports Foundation
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding; cycling; water skiing; whitewater rafting. Athletes served: Veterans, children and adults with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '88c8136f-9289-4911-abf8-0bb622a71845' AND (description IS NULL OR description = '');

-- Vermont Adaptive Ski and Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; cross country skiing; snowshoeing; canoeing; kayaking; stand up paddle boarding; cycling; mountain biking; sailing; indoor rock climbing; hiking; tennis; horseback riding; beeper baseball; environmental programs; wellness retreats. Athletes served: Youth and adults of all ages with physical, cognitive, developmental, intellectual, emotional or behavioral disabilities or neurodiversity, athletes who are blind or have low vision, and veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '18a9facb-61f3-4246-8031-79a32a57e54d' AND (description IS NULL OR description = '');

-- Wintergreen Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; mono skiing; bi skiing; snowboarding; canoeing; kayaking. Athletes served: People of all ages with all types of disabilities, including injured veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c73b0784-b96a-4754-8962-7807dd896e76' AND (description IS NULL OR description = '');

-- Abilities Unlimited of the Carolinas
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Children with physical disabilities, including amputees and children with spina bifida or cerebral palsy, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3d84c995-1d59-4b14-85ca-2a5f7010a10a' AND (description IS NULL OR description = '');

-- AccesSurf Hawaii Inc. – Paralympic Sport Hawaii
UPDATE organizations SET description = 'Sports and activities: Surfing; swimming; outrigger canoe paddling. Athletes served: People with physical or cognitive disabilities, including wounded warriors.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a00a07e5-617e-4612-923e-05b273422ba3' AND (description IS NULL OR description = '');

-- Adaptive Expeditions – Charleston
UPDATE organizations SET description = 'Sports and activities: Adaptive paddlesports; wheelchair tennis; pickleball; cycling; handcycling; swimming; natural history outings. Athletes served: Individuals with physical and sensory disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '25766bc3-c3ce-4453-98ab-f41588fcdc5b' AND (description IS NULL OR description = '');

-- Adaptive Sports New England
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; rowing; swimming; beep baseball; wheelchair football; sailing; wheelchair track. Athletes served: Youth and adults who are blind or have low vision or mobility disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd4a75efa-300e-4f80-92d5-e8a8f6d74033' AND (description IS NULL OR description = '');

-- Amputee Coalition
UPDATE organizations SET description = 'Sports and activities: Peer mentoring; support groups; youth and family programs; youth camp. Athletes served: People with limb loss and limb difference, and their families and caregivers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '592375c9-cab3-4f07-8447-13b2f672faf0' AND (description IS NULL OR description = '');

-- Aspen Camp (Deaf & Hard of Hearing)
UPDATE organizations SET description = 'Sports and activities: Skiing; snowboarding; snowshoeing; outdoor camps; ASL immersion camps; job skills training. Athletes served: Deaf and hard of hearing children, youth, adults and families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd82ee02c-72d3-4a4f-8e2f-e1f98977e1c2' AND (description IS NULL OR description = '');

-- BlazeSports America
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; track and field; swimming; wheelchair tennis; adaptive soccer; wheelchair football; archery; cycling; rowing; water aerobics; fitness training; yoga; tennis; bowling; youth camp. Athletes served: Youth, adults, veterans and active duty service members with physical disabilities, including spina bifida, spinal cord injury, traumatic brain injury, cerebral palsy, dwarfism, amputations and visual impairments, and veterans with PTSD.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '56c7c499-0d9a-471d-98d0-59e6201e4d51' AND (description IS NULL OR description = '');

-- Central California Adaptive Sports Center
UPDATE organizations SET description = 'Sports and activities: Sit skiing; stand up skiing; snowshoeing; cross country skiing; mountaineering; hiking; mountain biking; kayaking; paddleboarding; fishing; rock climbing; camping. Athletes served: Persons with cognitive or physical disabilities, including veterans and members of the armed forces with disabilities, people with spinal cord injuries, and people who are blind or have low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a3974ea8-0557-473d-81d4-f931dd73c5d0' AND (description IS NULL OR description = '');

-- Charlotte Rollin Bobcats
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Youth and adults with physical disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dbe02551-b113-4ed6-b507-adc37abaa1fe' AND (description IS NULL OR description = '');

-- City of Fort Collins Adaptive Recreation
UPDATE organizations SET description = 'Sports and activities: Recreation and leisure programs. Athletes served: Community members with physical, intellectual or emotional disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a580f4bf-f3d6-4527-8ed3-f6cd477da549' AND (description IS NULL OR description = '');

-- Columbus Rec & Parks – Columbus
UPDATE organizations SET description = 'Sports and activities: Adaptive aquatics; blind hockey; boccia; wheelchair track and field; wheelchair basketball; wheelchair rugby; wheelchair softball; wheelchair tennis. Athletes served: People with disabilities in Central Ohio and surrounding areas.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '626e65a4-2cdc-475a-9ac9-fd50d8f536f8' AND (description IS NULL OR description = '');

-- Fox Valley Special Recreation Association
UPDATE organizations SET description = 'Sports and activities: Special Olympics sports; basketball; swim team; fitness; aquatics; summer day camp; adult day programs; crafts; performing arts; social outings. Athletes served: Children, teens and adults with disabilities in the Fox Valley region.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd408e015-7663-4986-a244-6862f5b8b489' AND (description IS NULL OR description = '');

-- Green Mountain Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; sit skiing; Nordic skiing; swimming; indoor rock climbing; skateboarding; movement classes; kayaking; mountain biking; monoskiing; peer mentoring. Athletes served: People with disabilities living in or visiting Vermont, including people with physical or neurological disabilities and complex disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a39cd654-56bf-4d3c-996b-5b5ef4a51d01' AND (description IS NULL OR description = '');

-- High Country Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; kayaking; mountain biking; hiking; climbing; indoor rock climbing. Athletes served: Youth and adults with physical or cognitive disabilities, including people who are blind or have low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3fd30c54-ce35-44f1-b288-91a9b70cedba' AND (description IS NULL OR description = '');

-- Incight
UPDATE organizations SET description = 'Sports and activities: Scholarships; job fairs; career readiness workshops; leadership development. Athletes served: People with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '20d78885-54c6-4266-bcef-f30b277788ee' AND (description IS NULL OR description = '');

-- Kentwood Parks & Recreation
UPDATE organizations SET description = 'Sports and activities: Archery; pickleball; boccia; downhill skiing; rock climbing; bowling; golf; track and field; kayaking; wakeboarding; water skiing; cycling; cooking; dances and social events. Athletes served: People with disabilities in and around Kentwood.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '82c4bec5-30e8-41f6-b5ae-2237c7d3f4e0' AND (description IS NULL OR description = '');

-- Lakeshore Junior Wheelchair Basketball
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Youth with physical disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9105aab9-cb93-4272-b5db-9af5ecd81d29' AND (description IS NULL OR description = '');

-- Madison School & Community Recreation
UPDATE organizations SET description = 'Sports and activities: Bocce; bowling; chair exercise; social clubs; dance and movement; pottery; swim lessons; recreational swim; park walks; yoga. Athletes served: Youth and adults with disabilities, along with their family and friends.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '070f57df-48e5-4d54-a407-1f7d498b11f6' AND (description IS NULL OR description = '');

-- Mary Free Bed Wheelchair and Adaptive Sports – Grand Rapids
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair rugby; wheelchair tennis; sled hockey; wheelchair lacrosse; goalball; handcycling; power soccer; wheelchair softball. Athletes served: Children and adults with physical disabilities or limited mobility, including athletes who are blind or have low vision and power wheelchair users.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ae200b8a-8b08-4ef1-972e-f5445d07d84e' AND (description IS NULL OR description = '');

-- Midwest Adaptive Sports (Kansas City)
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair football; wheelchair rugby; wheelchair softball; wheelchair tennis; pickleball; skiing; snow tubing; water skiing; kayaking; fishing; camps. Athletes served: Youth and adults with physical, cognitive, emotional or behavioral disabilities, including people with spinal cord injuries, amputations and vision impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f5ddbea5-747b-4b2b-8d0b-647a24f7fe14' AND (description IS NULL OR description = '');

-- New England Nordic Ski Association
UPDATE organizations SET description = 'Sports and activities: Nordic skiing; para Nordic skiing; rollerskiing; youth ski programs; racing. Athletes served: Cross country skiers in New England, including para Nordic athletes who sit ski, ski standing, or are visually impaired.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '724ef294-dfe7-4801-8084-c5621945d2a7' AND (description IS NULL OR description = '');

-- Northeast Passage – Southern New Hampshire
UPDATE organizations SET description = 'Sports and activities: Archery; court sports; cycling; golf; ice skating; paddlesports; water skiing; winter sports; sled hockey; wheelchair rugby; power soccer; wheelchair lacrosse; bowling; recreational therapy. Athletes served: People living with visible and invisible disabilities, including veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3ceaf5c4-87b4-4b5e-9f0f-792ae8345daa' AND (description IS NULL OR description = '');

-- Ocean Healing Group
UPDATE organizations SET description = 'Sports and activities: Surfing; snorkeling; fishing; zip line tours; nature tours; horseback riding. Athletes served: Children and young adults with physical disabilities, including spinal cord injuries, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6194a27a-8240-4ac1-9163-39276a16bbc0' AND (description IS NULL OR description = '');

-- Operation Surf
UPDATE organizations SET description = 'Sports and activities: Adaptive surfing; yoga; mindfulness; peer support. Athletes served: Injured military service members and veterans, including those living with PTSD.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4248d97d-b9a3-4d03-a738-079a98c97eeb' AND (description IS NULL OR description = '');

-- ParaSport Spokane – Inland Northwest
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; track and field; sled hockey; swimming; goalball; strength and conditioning; parafencing; boccia; road racing. Athletes served: Youth and adults with physical disabilities and visual impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bf678ed2-f906-486e-a266-04c4783a710d' AND (description IS NULL OR description = '');

-- Piers Park Sailing Center – Boston
UPDATE organizations SET description = 'Sports and activities: Adaptive sailing; kayaking; marine science; harbor cruises. Athletes served: Youth and adults of all abilities, including people with mobility disabilities, spinal cord injury, hearing loss, vision loss and sensory sensitivities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'af293c1f-647b-4ca5-abdf-4772c2b02038' AND (description IS NULL OR description = '');

-- Sail To Prevail – Newport
UPDATE organizations SET description = 'Sports and activities: Therapeutic sailing. Athletes served: Children and adults with physical, intellectual and emotional disabilities and serious medical conditions, including paralysis, amputation, stroke, cerebral palsy, blindness, deafness, autism, epilepsy and pediatric cancer, and veterans with disabilities including PTSD.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e6f4f91a-7a0d-49a7-a19a-ac56acc992cd' AND (description IS NULL OR description = '');

-- Seattle Storm (Women’s Team)
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Women and teen girls with primarily lower limb disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9d23ed9c-e53b-400c-ae3c-93c4325e2a8e' AND (description IS NULL OR description = '');

-- Shifting Gears United
UPDATE organizations SET description = 'Sports and activities: Tandem cycling; handcycling; running; walking; wheelchair racing; water aerobics; swimming; snorkeling; kayaking; paddleboarding. Athletes served: Wounded veterans, first responders, and children and adults with disabilities, including people who are blind or have low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'eda805fb-8fa2-4104-a9a7-c3483b49eba4' AND (description IS NULL OR description = '');

-- SoCal Soaring Academy
UPDATE organizations SET description = 'Sports and activities: Glider flights; flight school; STEM aviation outreach. Athletes served: Veterans living with PTS and other injuries, and youth.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cf84e69f-14ed-432b-8833-b6f5f0755ba7' AND (description IS NULL OR description = '');

-- Southern Arizona Association for the Visually Impaired (SAAVI)
UPDATE organizations SET description = 'Sports and activities: Non visual skills training; independent living training; education and employment services; youth summer programs; rock climbing. Athletes served: Children, teens, adults and seniors across Arizona who are blind or have low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b5f264f7-3913-4d07-8198-0e48ed7992ce' AND (description IS NULL OR description = '');

-- STRIDE Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Bocce; bowling; camping; dance; golf; learn to ride a bike; kayaking; sailing; skiing; snowboarding; ski racing; sled hockey; swimming; tae kwon do; tennis; pickleball; wheelchair basketball; whitewater rafting; fitness classes; youth club. Athletes served: Individuals with disabilities, with a focus on youth and wounded veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '37f5416f-53de-4c3d-bd6f-582f84326a31' AND (description IS NULL OR description = '');

-- Team River Runner – Battle Creek
UPDATE organizations SET description = 'Sports and activities: Adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '91fc7802-ecf8-4b29-9ca8-f5f5dcfd0cba' AND (description IS NULL OR description = '');

-- Team River Runner – Columbia
UPDATE organizations SET description = 'Sports and activities: Whitewater paddling; flatwater paddling; adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f2ec8b0e-ed2e-4af3-8af1-ba599d88a08a' AND (description IS NULL OR description = '');

-- Team River Runner – Milwaukee
UPDATE organizations SET description = 'Sports and activities: Adaptive paddle sports; lake paddling. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f72f1222-059c-4d23-ba5f-b9c7e87d6907' AND (description IS NULL OR description = '');

-- Team River Runner – Southeast PA
UPDATE organizations SET description = 'Sports and activities: Adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5be39555-52f2-4d24-bd1b-0f31e8892cec' AND (description IS NULL OR description = '');

-- Team River Runner – Walter Reed
UPDATE organizations SET description = 'Sports and activities: Adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e52d32b3-4683-4782-b31f-d1574c8c5f64' AND (description IS NULL OR description = '');

-- Texas Regional Paralympic Sport
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; triathlon; cycling; sport clinics and camps; competitions; adaptive equipment loans. Athletes served: Youth and adults with physical and visual disabilities in Texas.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6737bbd4-eb7b-46bf-b826-bb017e6f7d5a' AND (description IS NULL OR description = '');

-- Three Rivers Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Bowling; snow skiing; water sports; cycling; paddling. Athletes served: People with disabilities, their families and friends.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5a588372-96ef-4ffb-8cfb-331be62a9837' AND (description IS NULL OR description = '');

-- Triangle Sled Hockey Association
UPDATE organizations SET description = 'Sports and activities: Ice hockey; street hockey. Athletes served: Individuals with cognitive or developmental disabilities, autism, Down syndrome and other disabilities who can stand independently.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5719f643-77a7-47b5-90ad-2248131027e6' AND (description IS NULL OR description = '');

-- Unite 2 Fight Paralysis
UPDATE organizations SET description = 'Sports and activities: Advocacy; education; podcast; annual symposium; research funding; fundraising races. Athletes served: People living with spinal cord injury and the spinal cord injury community.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '255ef72e-1313-4225-afed-632fd5d4d9e0' AND (description IS NULL OR description = '');

-- United States Wheelchair Rugby Association
UPDATE organizations SET description = 'Sports and activities: Wheelchair rugby; low point rugby. Athletes served: Men and women with qualifying disabilities, most with spinal cord injuries, as well as cerebral palsy, muscular dystrophy, amputations, polio and other neurological conditions.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b0213262-cae5-4809-a8f6-0e15f6ab08d8' AND (description IS NULL OR description = '');

-- U.S. Electric Wheelchair Hockey Association
UPDATE organizations SET description = 'Sports and activities: Power wheelchair hockey. Athletes served: People who use an electric power wheelchair in daily life.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7ae1d6c5-2db4-434c-8ad6-3cee11f5b974' AND (description IS NULL OR description = '');

-- Youth Challenge
UPDATE organizations SET description = 'Sports and activities: Basketball; football; soccer; baseball; volleyball; swimming; boccia; bowling; skiing; weightlifting; pickleball; archery; hiking; kayaking; handcycling; gardening; nature programs; ceramics; theatre; culinary arts; music; painting. Athletes served: Young people with physical disabilities, including cerebral palsy, spinal cord injuries and visual impairments, alongside peers without disabilities, plus some adult programs.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7a0b845b-e815-4b3b-8ab4-9c91d1e1b096' AND (description IS NULL OR description = '');

-- Camp Abilities SUNY Brockport
UPDATE organizations SET description = 'Sports and activities: Canoeing; kayaking; stand up paddleboarding; gymnastics; rollerblading; tandem biking; beep baseball; goalball; high ropes course; swimming; track and field; showdown. Athletes served: Children and teens who are blind, have low vision, or are deafblind.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6ff5316f-13ab-404b-890c-c947a1697fcf' AND (description IS NULL OR description = '');

-- Lake of the Woods Adaptive Watersports Foundation
UPDATE organizations SET description = 'Sports and activities: Adaptive water skiing; watersports. Athletes served: Veterans, adults and children with disabilities, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e99fd44d-fd05-4ba9-979e-be52c9e92e81' AND (description IS NULL OR description = '');

-- Adaptive Sports Program of Ohio
UPDATE programs SET description = 'Sports and activities: Power soccer; sled hockey; wheelchair basketball; wheelchair rugby; handcycling; track and field; road racing; wheelchair softball; wheelchair tennis; wheelchair football; camps and clinics. Athletes served: Youth and adults with physical disabilities, including veterans and people with amputations, spinal cord injury, cerebral palsy, brain injury, stroke, dwarfism and blindness or low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5ca9c948-ede9-4ecb-a061-c952dc50c916' AND (description IS NULL OR description = '');

-- Pineland Farms VAST Program
UPDATE programs SET description = 'Sports and activities: Target archery; laser rifle shooting; cycling; handcycling; fishing; disc golf; boccia; wheelchair basketball; pickleball; snowshoeing; cross country skiing; trail walking. Athletes served: Veterans with physical disabilities, traumatic brain injury or PTS who are eligible for VA support.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '84c9fe29-035f-4444-9587-f97820a2d190' AND (description IS NULL OR description = '');

-- University of Utah – TRAILS Program
UPDATE programs SET description = 'Sports and activities: Indoor cycling; handcycling; kayaking; sailing; target shooting; downhill skiing; cross country skiing; para Nordic skiing; swimming; wheelchair tennis; spinal cord injury wellness and education. Athletes served: People of all ability levels, including individuals with spinal cord injury and complex physical disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd9c19e5f-31cb-4412-ae38-407aab579b5d' AND (description IS NULL OR description = '');

-- Shifting Gears United
UPDATE programs SET description = 'Sports and activities: Tandem cycling; handcycling; running; walking; wheelchair racing; water aerobics; swimming; snorkeling; kayaking; paddleboarding. Athletes served: Wounded veterans, first responders, and children and adults with disabilities, including people who are blind or have low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a2eda344-7c6f-44cb-b276-add9fa4ce1a7' AND (description IS NULL OR description = '');

-- Achilles NYC
UPDATE programs SET description = 'Sports and activities: Running; walking; adaptive cycling; youth workouts; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hearing loss, dwarfism, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '59191997-4b23-5d1f-8ed4-f62ff28cae22' AND (description IS NULL OR description = '');

-- Achilles Denver
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hearing loss, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c98ca704-1a18-45f1-9aab-d851ba9447c1' AND (description IS NULL OR description = '');

-- Achilles Minnesota
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hearing loss, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8ab56d90-af1a-411e-90c7-3f8b6ba8f4fb' AND (description IS NULL OR description = '');

-- Achilles Philadelphia
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hearing loss, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '28b201b0-d606-475a-900c-df203ce2fc47' AND (description IS NULL OR description = '');

-- Achilles San Francisco Bay Area
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hearing loss, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '39ae225d-25b3-58f9-a68d-18e6e38b80f8' AND (description IS NULL OR description = '');

-- Achilles Westchester
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hearing loss, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '15151265-a9c6-517f-8abb-412320eba5ae' AND (description IS NULL OR description = '');

-- Thunder in the Valley Games (One-Day Try-It Clinic)
UPDATE programs SET description = 'Sports and activities: Track and field; air rifle; archery; swimming; powerlifting; handcycling; boccia clinics. Athletes served: Athletes with disabilities, including wheelchair athletes.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '29d3b439-db12-4589-86a7-ac5980280c4b' AND (description IS NULL OR description = '');

-- Ability360 – Paralympic Sport Phoenix
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair softball; amputee basketball; cheer and dance; dragon boat; power soccer; wheelchair football; wheelchair rugby; wheelchair tennis; swimming; outrigger canoe; pickleball; curling; golf; fitness; aquatics; camping; hiking; kayaking; rafting; fishing; rock climbing; mountain biking; snow skiing; barge rowing. Athletes served: People with disabilities and their families of different abilities, ages and experience levels, plus youth teams and military members past and present.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b7827006-4eda-47a0-a38d-87ad4d19a73b' AND (description IS NULL OR description = '');

-- Adaptive Adventures
UPDATE organizations SET description = 'Sports and activities: Skiing; snowboarding; cycling; dragon boat racing; kayaking; paddleboarding; rock climbing; waterskiing; wakeboarding; whitewater rafting. Athletes served: Children and youth ages 6 to 20 and adults with physical disabilities, their families, and injured veterans and active duty military.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '387be9ff-5129-4a84-a95f-64809a68863e' AND (description IS NULL OR description = '');

-- Adaptive Fusion Dragon Boat Club
UPDATE organizations SET description = 'Sports and activities: Dragon boat paddling; outrigger canoe training. Athletes served: Paddlers who are blind, deaf, amputees, or have physical or mental challenges, along with support paddlers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '56b8d00d-55ea-4242-8b1a-6936e0594002' AND (description IS NULL OR description = '');

-- Adaptive Sports Northwest – Portland
UPDATE organizations SET description = 'Sports and activities: Archery; cycling; goalball; pickleball; power soccer; sitting volleyball; swimming; track and field; wheelchair basketball; wheelchair rugby; virtual programs. Athletes served: Children and adults with physical disabilities and visual impairments, from recreational players to athletes training for Paralympic competition.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '26e936a3-623b-48e2-b250-7256825dcb82' AND (description IS NULL OR description = '');

-- Angel City Sports
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; blind soccer; track and field; golf; multisport clinics. Athletes served: Youth, adults, and veterans with physical disabilities or visual impairments, plus first responders at its veterans weekend.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0a952ffb-4765-49fd-a97e-671200072a0d' AND (description IS NULL OR description = '');

-- Aspen Valley Ski and Snowboard Club (AVSC)
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; freestyle skiing; freeride; Nordic skiing; snowboarding; ski mountaineering; mountain biking; trampoline. Athletes served: Youth in the greater Roaring Fork Valley, from recreational lessons to competitive teams.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ac064049-e8cc-4a71-a371-cb8d73f55a57' AND (description IS NULL OR description = '');

-- Bay Area Association of Disabled Sailors
UPDATE organizations SET description = 'Sports and activities: Small boat sailing; keelboat sailing; sailboat racing. Athletes served: People with all forms of disability, with no sailing experience necessary.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '381ebfaf-21b0-4553-ba00-196b7d77ae58' AND (description IS NULL OR description = '');

-- Central Maine Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Skiing; snowboarding; snowshoeing; sled hockey; track and field; kayaking; cycling. Athletes served: People of all ages with any disability, physical, mental or behavioral, including students training for Special Olympics and para sports.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0715b244-617f-4df8-91c4-eaf88c1bc3e3' AND (description IS NULL OR description = '');

-- CHD’s Disability Resources
UPDATE organizations SET description = 'Sports and activities: Sled hockey; cycling; fishing; rock climbing; wheelchair basketball; dance and movement; swimming; CrossFit. Athletes served: Adults and children with disabilities of all ages and abilities in Western Massachusetts and Connecticut.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd15cfee4-946e-44f2-a71b-d3ca6d4057a3' AND (description IS NULL OR description = '');

-- City of Boise Adaptive Recreation
UPDATE organizations SET description = 'Sports and activities: Adaptive cycling; waterskiing; whitewater rafting; wheelchair basketball; wheelchair rugby; sports clinics; snowshoeing; tubing; disc golf; fishing; camping; fitness; dance; yoga; art and cooking classes; social clubs. Athletes served: Youth, teens and adults with disabilities and their families and friends, with wheelchair sports for people with physical disabilities and a youth sports camp for ages 6 to 19 with physical disabilities that limit mobility.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a1177699-e933-4de0-bbe3-628c8eeab71a' AND (description IS NULL OR description = '');

-- Community Boating, Inc.
UPDATE organizations SET description = 'Sports and activities: Sailing lessons; guided recreational sails; sailboat racing. Athletes served: Anyone who needs additional assistance to sail, including veterans, people with visual impairments, children with developmental disabilities, and adults with chronic injury or illness.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b41ecdcc-07ce-49e9-9244-f8f4417b328b' AND (description IS NULL OR description = '');

-- COSTA Therapy, Inc.
UPDATE organizations SET description = 'Sports and activities: Adaptive surfing; surf therapy; surf and wellness retreats; beach cleanups. Athletes served: Veterans, first responders, service members and their families, adaptive athletes, and military youth and foster youth.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd31962be-9af2-4c25-ab5c-157224590ce4' AND (description IS NULL OR description = '');

-- Disabled Athlete Sports Association – St. Louis
UPDATE organizations SET description = 'Sports and activities: Air rifle; archery; boccia; golf; para powerlifting; power soccer; rock climbing; sled hockey; swimming; tennis; track and field; wheelchair basketball; wheelchair rugby; fitness. Athletes served: Children and adults with physical and visual disabilities, from first time movers to Paralympic hopefuls.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e3cb007a-bf43-470e-8ff2-5927738b49f7' AND (description IS NULL OR description = '');

-- DREAM Adaptive Recreation, Inc.
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; cycling; mountain biking; paddling; fishing; watersports. Athletes served: People ages 5 through adulthood with physical, cognitive, intellectual, developmental, and sensory disabilities, including military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '70771ff4-609d-4f2d-863f-decbb2707c92' AND (description IS NULL OR description = '');

-- Groton Parks and Recreation
UPDATE organizations SET description = 'Sports and activities: Basketball; floor hockey; aquatics; track and field; wheelchair track and field; tennis; soccer; cycling; sailing; golf; bocce; bowling; volleyball. Athletes served: Athletes with intellectual disabilities from age 6, plus partners without disabilities on Unified Sports teams.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '77aa6806-0959-4040-a963-d4bbb8567393' AND (description IS NULL OR description = '');

-- Maine Adaptive Sports & Recreation
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; snowshoeing; mono skiing; paddling; cycling; mountain biking; climbing; pickleball; golf. Athletes served: People age 4 and older with a permanent physical or cognitive disability, including skiers with visual impairments, sit skiers with paralysis, and veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c6141d8-4b6c-473e-8bf7-7bb16d44debe' AND (description IS NULL OR description = '');

-- Mount Washington Valley Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Adaptive skiing; snowboarding. Athletes served: People of all ages with physical or cognitive disabilities, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7fe9e1bf-2c6e-472d-bf46-3772e60ecf5a' AND (description IS NULL OR description = '');

-- National Sports Center for the Disabled – Winter Park & Denver
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; ski biking; Nordic skiing; snowshoeing; alpine ski racing; fat tire snow biking; rock climbing; archery; air rifle; horseback riding; mountain biking; canoeing; kayaking; paddleboarding; sailing; whitewater rafting; camps. Athletes served: Youth, teens, and adults with any type of disability, including veterans and active duty military with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '22057a75-49fc-42a6-a68e-557692cdea12' AND (description IS NULL OR description = '');

-- Oklahoma Adaptive Sports Association (OKASA)
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; track and field; swimming; water skiing; kayaking; tubing; catamaran and pontoon boat rides. Athletes served: Children and adults age 2 and up with physical disabilities who function at or near age level, including ambulatory athletes and wheelchair users.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ef87e95f-eaf7-471b-94fd-0c210da089c3' AND (description IS NULL OR description = '');

-- Oregon Adaptive Sports – Central Oregon
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; snowshoeing; cycling; mountain biking; gravel riding; paddling; golf. Athletes served: Youth and adults with physical, sensory, cognitive, intellectual and developmental disabilities, including people who are blind, low vision, Deaf or hard of hearing, and people with neurological conditions.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e8c182d9-802f-48c7-b007-389c459a9433' AND (description IS NULL OR description = '');

-- ParaSports – San Antonio
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair softball; wheelchair racing; youth programs. Athletes served: People with physical challenges, including young athletes.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bccb7a84-00fd-4fe7-97b5-3292123e2e9a' AND (description IS NULL OR description = '');

-- Pittsburgh Mighty Penguins Sled Hockey
UPDATE organizations SET description = 'Sports and activities: Sled hockey. Athletes served: Children and adults with physical disabilities, with youth teams ages 5 to 17 and adult teams 18 and older.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'efa71cb5-f813-492e-b793-db4bf93aceca' AND (description IS NULL OR description = '');

-- Riekes Center for Human Enhancement
UPDATE organizations SET description = 'Sports and activities: Strength and conditioning; boxing fitness; archery; virtual fitness. Athletes served: Veterans through VA fitness and archery classes, and people with Parkinson''s disease.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd7b9e35a-b919-4bce-ae05-4355ce8a5c82' AND (description IS NULL OR description = '');

-- Salute Military Golf Association
UPDATE organizations SET description = 'Sports and activities: Golf; golf clinics; golf tournaments. Athletes served: Post 9/11 wounded and injured veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '72d00e55-dbaa-4e7c-ab2f-55cecb9a8ed5' AND (description IS NULL OR description = '');

-- Seattle Wheelchair Rugby Association
UPDATE organizations SET description = 'Sports and activities: Wheelchair rugby. Athletes served: People with disabilities, from recreational players to elite athletes, including people with spinal cord injuries.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '42a97335-4961-4ec6-b5a7-8b5029e4e99e' AND (description IS NULL OR description = '');

-- Shirley Ryan AbilityLab
UPDATE organizations SET description = 'Sports and activities: Sled hockey; archery; boccia; cycling; golf; kayaking; mountain biking; rock climbing; wheelchair basketball; wheelchair rugby; wheelchair softball; sailing; fitness. Athletes served: Youth and adults with a primary physical disability, from recreational players to elite athletes, plus a military sports program.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '96f7d490-3dc7-4298-81bc-a5887e50d547' AND (description IS NULL OR description = '');

-- South Orlando Rowing Association
UPDATE organizations SET description = 'Sports and activities: Rowing; sculling; sweep rowing; indoor rowing. Athletes served: Middle and high school students in Central Florida.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '47602422-aa3c-4c3b-af6e-3b6828bc0489' AND (description IS NULL OR description = '');

-- Sportable Richmond Adaptive Sports & Recreation
UPDATE organizations SET description = 'Sports and activities: Archery; wheelchair basketball; wheelchair rugby; power soccer; para swimming; wheelchair pickleball; wheelchair ballroom dance; cycling; paracycling; rock climbing; fitness; boccia. Athletes served: People with physical disabilities, visual impairments, and those needing physical accommodations, including athletes with spina bifida, spinal cord injury, amputation and cerebral palsy.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '90b97b9e-3684-4d4b-9f51-414f1c27e11f' AND (description IS NULL OR description = '');

-- Team River Runner Denver
UPDATE organizations SET description = 'Sports and activities: Kayaking; flatwater and moving water paddling; pool training. Athletes served: Veterans and their family members and caregivers, with adaptive equipment for paddlers with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f6b1795d-0e90-46ce-bbfd-c306d708702b' AND (description IS NULL OR description = '');

-- Team River Runner – Portland
UPDATE organizations SET description = 'Sports and activities: Adaptive paddling; kayaking. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '99b7d215-75bf-4a5c-add3-f1a605e5aab1' AND (description IS NULL OR description = '');

-- Team River Runner – Spokane
UPDATE organizations SET description = 'Sports and activities: Adaptive paddling; kayaking. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f76d83be-af8b-4c09-aed4-9f34c9fc55b0' AND (description IS NULL OR description = '');

-- Team River Runner – Wilmington
UPDATE organizations SET description = 'Sports and activities: Adaptive paddling; kayaking. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '933e1c91-f2aa-4b0a-80d4-63eb81ceffa9' AND (description IS NULL OR description = '');

-- Texas Rowing for All – Austin
UPDATE organizations SET description = 'Sports and activities: Rowing; paddling; summer camps. Athletes served: People with physical, sensory, and intellectual disabilities, and veterans and active military members.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '65e6dc04-b819-4bce-be76-c1e1c4db2511' AND (description IS NULL OR description = '');

-- Three Rivers Rowing Association
UPDATE organizations SET description = 'Sports and activities: Adaptive rowing; para rowing. Athletes served: Athletes age 12 and up with disabilities, novice to elite, including those with limited trunk control, leg impairments, visual impairments or cognitive impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '21fb5f24-2f5c-4582-8909-188d4aeff192' AND (description IS NULL OR description = '');

-- Triumph Foundation
UPDATE organizations SET description = 'Sports and activities: Wheelchair hockey; wheelchair basketball; racquetball; baseball; wheelchair rugby; hand cycling; scuba; wheelchair skating; power wheelchair rodeo; target shooting; 5K walk, run or roll; fitness. Athletes served: Children, adults, and veterans with spinal cord injury or disorder and other people with mobility impairments in Southern California, including the newly injured.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8f3e1aed-c996-4e0d-a2b0-035e1d3ab9d0' AND (description IS NULL OR description = '');

-- United States Adaptive Recreation Center
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; mono skiing; bi skiing; water skiing; paddle sports; fishing. Athletes served: People with physical and cognitive disabilities, regardless of swimming ability for summer water sports.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e1066bc4-0249-49ef-916f-ce9ec0127246' AND (description IS NULL OR description = '');

-- University of Arizona
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair track and road racing; tennis; para swimming; golf. Athletes served: University student athletes in wheelchair and adaptive sports, plus young people ages 13 to 26 at its wheelchair basketball camp.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '66389716-ec48-42f2-8a9d-30fe5e1eb7d3' AND (description IS NULL OR description = '');

-- Waterville Valley Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; adaptive cycling; trail rides. Athletes served: People with disabilities of all ages and abilities, with family and friends welcome on group rides.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '14c5863e-e2a0-408f-9e67-b59f86ee967b' AND (description IS NULL OR description = '');

-- Cincinnati Tennis Foundation
UPDATE organizations SET description = 'Sports and activities: Wheelchair tennis; adaptive tennis; standing adaptive tennis; blind and visually impaired tennis; youth tennis; padel. Athletes served: Cincinnati youth, including those in underserved neighborhoods, adults, and juniors and adults who use wheelchairs or are blind or low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a96e0bfb-d209-4440-9c13-305d906ccaea' AND (description IS NULL OR description = '');

-- Catch A Lift Fund
UPDATE organizations SET description = 'Sports and activities: Fitness programs; coaching; wellness and nutrition support; peer community. Athletes served: Post 9/11 combat injured veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ecda2e7a-a2a4-41ef-b49c-6ad3de0ae158' AND (description IS NULL OR description = '');

-- American Association of Adapted Sports Programs
UPDATE programs SET description = 'Sports and activities: Wheelchair handball; wheelchair basketball; wheelchair football; wheelchair track and field. Athletes served: Students with physical disabilities on school teams across Georgia.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '76744902-91b9-48b7-b6bc-5e1bafe0cce1' AND (description IS NULL OR description = '');

-- Rehabilitation Hospital of Indiana (RHI) Sports Program – Indianapolis
UPDATE programs SET description = 'Sports and activities: Wheelchair basketball; wheelchair tennis; power soccer; beep baseball; wheelchair lacrosse; sled hockey; blind hockey; wheelchair rugby; fencing; archery; water skiing; paratriathlon; racing; track and field; para powerlifting; recreational clinics. Athletes served: Youth and adults with spinal cord, orthopedic, neuromuscular, and visual impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '77b77320-1cb7-4f88-b334-926a08d508ed' AND (description IS NULL OR description = '');

-- USA Volleyball – Sitting Program
UPDATE programs SET description = 'Sports and activities: Sitting volleyball. Athletes served: Women athletes on the U.S. national sitting volleyball team.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '16d14ab5-7a85-4f69-8e51-88b631b5060b' AND (description IS NULL OR description = '');

-- Achilles Washington D.C.
UPDATE programs SET description = 'Sports and activities: Running; walking; adaptive cycling; handcycling; tandem cycling; endurance events. Athletes served: People of all ages with disabilities, including blind or low vision, Deaf or hard of hearing, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injury and brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c445482e-e416-4f08-ba5e-5b05b4cfd0cc' AND (description IS NULL OR description = '');

-- Achilles Connecticut
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blind or low vision, Deaf or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4a5f1878-e83d-4da9-a4d1-4c330c44f64a' AND (description IS NULL OR description = '');

-- Achilles St. Louis
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blind or low vision, Deaf or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '564e2466-1668-480a-a660-3de6663ab3d4' AND (description IS NULL OR description = '');

-- Achilles Houston
UPDATE programs SET description = 'Sports and activities: Running; walking; handcycling; endurance events. Athletes served: People of all ages with disabilities, including blind or low vision, Deaf or hard of hearing, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injury and brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f3309b46-3602-43fd-b8f0-0affb93d8391' AND (description IS NULL OR description = '');

-- Achilles Boulder
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blind or low vision, Deaf or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '07083bd5-8c5f-54a4-a972-ff302ce8e2c1' AND (description IS NULL OR description = '');

-- Adaptive Adventures, Chicago
UPDATE programs SET description = 'Sports and activities: Skiing; snowboarding; cycling; dragon boat racing; kayaking; paddleboarding; rock climbing; waterskiing; wakeboarding; whitewater rafting. Athletes served: Children and youth ages 6 to 20 and adults with physical disabilities, their families, and injured veterans and active duty military.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '21db8fe7-8c0a-416b-ab6b-5a79f95fb5c1' AND (description IS NULL OR description = '');

-- Ability PLUS, Inc.
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; cross country skiing; snowshoeing; cycling; hiking; kayaking; waterskiing. Athletes served: People age 4 and up with any type of disability, including physical, developmental, cognitive and emotional disabilities and autism.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a199684b-19a9-41da-9b83-82ce3de5a518' AND (description IS NULL OR description = '');

-- Asphalt Green
UPDATE organizations SET description = 'Sports and activities: Swimming; basketball; soccer; playground skills; private sport lessons. Athletes served: Kids and teens of all needs and abilities, including those with ADHD, autism, sensory processing disorder, gross motor delays and Down syndrome.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0027a07d-b676-42ba-9d37-d03a645c2763' AND (description IS NULL OR description = '');

-- Challenge Alaska – Paralympic Sport Alaska
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; biathlon; sled hockey; hockey; wheelchair basketball; wheelchair tennis; wheelchair lacrosse; goalball; five a side football; para cycling; mountain biking; rock climbing; archery; precision shooting; track and running; hiking; camping and backpacking; fishing; ice fishing; water sports. Athletes served: Alaskans with physical and intellectual disabilities, including veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '26c4f6ed-5822-4bf6-9089-c42508316882' AND (description IS NULL OR description = '');

-- City of Boulder EXPAND
UPDATE organizations SET description = 'Sports and activities: Volleyball; basketball; swimming; dance; water aerobics; fitness; waterskiing; Special Olympics training. Athletes served: Youth and adults with disabilities, mostly intellectual and developmental disabilities, with adaptive waterskiing for people with physical disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dd9cdf52-2a34-47eb-9045-34143f8a1648' AND (description IS NULL OR description = '');

-- Community Rowing, Inc. – Boston
UPDATE organizations SET description = 'Sports and activities: Para rowing. Athletes served: Youth and adults with physical, sensory and intellectual disabilities, at all experience levels.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c54340a0-6578-49a0-8961-69d415071253' AND (description IS NULL OR description = '');

-- Dare2tri Paratriathlon Club
UPDATE organizations SET description = 'Sports and activities: Swimming; cycling; running; triathlon. Athletes served: Youth and adults with physical disabilities and visual impairments, and injured service members.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5212b9f0-83a6-4ab9-a7ac-197f0e6cdf7e' AND (description IS NULL OR description = '');

-- Disabled Sports Eastern Sierra
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; mountain biking; road cycling; paddling; water sports; climbing; hiking. Athletes served: Kids and adults of all ages and abilities, including people with intellectual and cognitive disabilities, and veterans and active duty service members with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cd86ffb5-16df-4f2e-a4db-4d41853a46c7' AND (description IS NULL OR description = '');

-- Fayetteville-Cumberland Parks & Rec
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; archery; air gun shooting; buddy football; buddy basketball; buddy baseball. Athletes served: Adults, veterans and service members with disabilities, and children age 5 through grade 12 with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b0228cc8-162b-4193-86ee-f720231aca75' AND (description IS NULL OR description = '');

-- Golden State Road Warriors
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Athletes with disabilities who play competitive wheelchair basketball.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bf382eb5-be37-4b3a-a2d5-13c8ed46ee3d' AND (description IS NULL OR description = '');

-- Happy Trails Riding Academy
UPDATE organizations SET description = 'Sports and activities: Therapeutic horsemanship; equine facilitated psychotherapy; equine services for veterans. Athletes served: Children and adults age six and up with physical, cognitive and emotional disabilities, including ADHD, developmental delay, autism, cerebral palsy, Down syndrome and post traumatic stress, and veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cddeb5d4-cc81-4a8f-8bab-5e510d32ade9' AND (description IS NULL OR description = '');

-- Hospital for Special Care – Paralympic Sport Club Connecticut
UPDATE organizations SET description = 'Sports and activities: Boccia; power soccer; racing; swimming; table tennis; tennis; track and field; wheelchair basketball; road race training; indoor golf. Athletes served: Children and adults with physical disabilities, from recreation to high level competition.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '81df50cf-d266-4394-90c3-5652acab9f5f' AND (description IS NULL OR description = '');

-- Lincolnway Special Recreation Association
UPDATE organizations SET description = 'Sports and activities: Boccia; wheelchair basketball; wheelchair softball; wheelchair football; Special Olympics sports; adaptive duathlon; recreation and social programs. Athletes served: People of all ages with intellectual or physical disabilities, with adapted sports for people age 3 and up with physical or visual impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e0ad448-76b2-465f-94a1-eb81bd29a676' AND (description IS NULL OR description = '');

-- Maine-Niles Association of Special Recreation
UPDATE organizations SET description = 'Sports and activities: Volleyball; basketball; track and field; powerlifting; bowling; softball; golf; aquatics; fitness; adaptive sports; cultural arts. Athletes served: Children, teens and adults with disabilities, including youth ages 3 to 22, adults with intellectual disabilities, and adults with physical or visual impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4c700811-51d7-47c1-af8d-d03fae1adbee' AND (description IS NULL OR description = '');

-- Move United
UPDATE organizations SET description = 'Sports and activities: Adaptive skiing; snowboarding; wheelchair basketball; wheelchair rugby; wheelchair football; sled hockey; swimming; track and field; cycling; rock climbing; kayaking; sailing; shooting. Athletes served: People with disabilities of all ages across the country, served mostly through its member organizations, including wounded warfighters.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6d8ad4d4-0077-4800-9317-c0e8370acd3c' AND (description IS NULL OR description = '');

-- National Wheelcats
UPDATE organizations SET description = 'Sports and activities: Sled hockey; wheelchair tennis; wheelchair basketball; wheelchair softball; wheelchair rugby; water skiing; fishing; shooting. Athletes served: Youth and adults with disabilities, mainly in Kentucky and Tennessee, with quad rugby for athletes with quadriplegia.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a04151bd-2359-45f9-bf83-518ce2597127' AND (description IS NULL OR description = '');

-- North Jersey Navigators
UPDATE organizations SET description = 'Sports and activities: Track and field; swimming; archery; triathlon; road racing; boccia. Athletes served: Children, young adults and adults with physical disabilities, ages 7 to 76, including veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6c47d309-c28b-4071-9416-3d5af182b21c' AND (description IS NULL OR description = '');

-- Oklahoma City Boathouse
UPDATE organizations SET description = 'Sports and activities: Para rowing; kayak football; whitewater rafting. Athletes served: People who are blind or have low vision, and veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0851fff7-6cfa-4f1b-8a36-bc94f5dbf19d' AND (description IS NULL OR description = '');

-- Ozark Adaptive Sports Association (OzASA)
UPDATE organizations SET description = 'Sports and activities: Adaptive cycling; archery; fishing; wheelchair pickleball; adaptive mountain biking; bowling; wheelchair basketball; wheelchair tennis. Athletes served: People with physical disabilities in Northwest Arkansas.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'aa92d8a4-c704-47d8-bf22-976b9623259a' AND (description IS NULL OR description = '');

-- PossAbilities at Loma Linda University
UPDATE organizations SET description = 'Sports and activities: Adaptive baseball; wheelchair basketball; adaptive flag football; cycling; adaptive swimming; skiing; Paralympic training. Athletes served: People with permanent physical disabilities and veterans, with baseball and flag football teams for players with cognitive and developmental disabilities, and youth and adult wheelchair basketball teams.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '53ba8186-6257-470c-8809-a6fe72a643ab' AND (description IS NULL OR description = '');

-- Rio Salado Rowing Club – Paralympic Sport Valley of the Sun
UPDATE organizations SET description = 'Sports and activities: Adaptive rowing. Athletes served: People with disabilities and functional limitations, for recreational and competitive rowing.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ccba8a33-ea16-485c-be18-4748f4ad4f7c' AND (description IS NULL OR description = '');

-- S.M.C.L Foundation & Associates – New Orleans
UPDATE organizations SET description = 'Sports and activities: Wheelchair football; adaptive tennis; wheelchair motocross. Athletes served: Military veterans and people with disabilities of all abilities and experience levels.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2a896d48-7144-44b7-b58e-cd6f45659343' AND (description IS NULL OR description = '');

-- Southeast Alaska Independent Living
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; snowshoeing; ice skating; hiking; biking; kayaking; fishing; rock climbing; rafting; horseback riding; swimming; camping; challenge course. Athletes served: Seniors and people with disabilities of all ages in Southeast Alaska, including youth ages 7 to 18 in inclusive day camps.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3c81a49e-c3c9-4235-8590-4d01c7973410' AND (description IS NULL OR description = '');

-- Space Coast Hurricanes Sled Hockey
UPDATE organizations SET description = 'Sports and activities: Sled hockey. Athletes served: Youth and adults who are not able to play stand up hockey, including amputees, people with paraplegia, spina bifida, autism or MS, and veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2dad6a35-40e7-4a7a-99ab-ebaf7db0780f' AND (description IS NULL OR description = '');

-- Sports Association, Gaylord Hospital – Paralympic Sport Southern New England
UPDATE organizations SET description = 'Sports and activities: Archery; boccia; boxing; adaptive cycling; fitness; golf; kayaking; paratriathlon; pickleball; rock climbing; skiing; snowboarding; sled hockey; fishing; water skiing; wheelchair rugby; wheelchair tennis. Athletes served: People with physical disabilities or visual impairments, including veterans and service members with physical disabilities, visual impairments or PTSD.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fe5057c2-0f95-491f-a2ed-a5aecf8fa32c' AND (description IS NULL OR description = '');

-- Team Paradise Sailing – Paralympic Sport Miami
UPDATE organizations SET description = 'Sports and activities: Sailing. Athletes served: People of all ages and skill levels, including people with disabilities, veterans and first responders, and underresourced communities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9399efbf-9b24-4925-bc2c-aeb45c759a56' AND (description IS NULL OR description = '');

-- Team River Runner – Fredericksburg
UPDATE organizations SET description = 'Sports and activities: Adaptive paddle sports. Athletes served: Active duty service members, veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3e767cc3-3aef-4c6e-a291-de3d9fceb42d' AND (description IS NULL OR description = '');

-- Team River Runner – Johnson City / Tri-Cities
UPDATE organizations SET description = 'Sports and activities: Adaptive paddle sports; pool sessions; river training. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '69d2dc48-7b22-486b-9f9d-5519e4996511' AND (description IS NULL OR description = '');

-- Team River Runner – Newbury
UPDATE organizations SET description = 'Sports and activities: Kayaking. Athletes served: Injured and affected military service members and veterans, people with disabilities of all abilities, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9e014589-77dc-4fb5-8ede-cb4227192bff' AND (description IS NULL OR description = '');

-- The Ability Experience
UPDATE organizations SET description = 'Sports and activities: Running; walking; wheelchair racing; cycling; hiking. Athletes served: People with and without disabilities who take part in endurance events together.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b21605a2-e61c-4542-85d7-b3e8a80f683b' AND (description IS NULL OR description = '');

-- Thunder in the Valley Games
UPDATE organizations SET description = 'Sports and activities: Track; field; air rifle; archery; powerlifting; handcycling; boccia. Athletes served: Athletes with disabilities, in a Move United sanctioned competition.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '06444a7e-c456-4801-affe-fda1f3062b80' AND (description IS NULL OR description = '');

-- United States Association of Blind Athletes (USABA)
UPDATE organizations SET description = 'Sports and activities: Goalball; blind soccer; beep baseball; cycling; judo; powerlifting; swimming; track and field; triathlon. Athletes served: Children, youth, adults and veterans who are blind or have low vision, from grassroots to Paralympic level.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '928ed8bf-d4ee-4211-818a-8218c7292601' AND (description IS NULL OR description = '');

-- University of Maryland Rehab & Orthopaedic Institute
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair tennis; wheelchair rugby; adapted golf. Athletes served: Teens and adults age 15 and up with physical disabilities after stroke, brain injury, spinal cord injury, amputation or other chronic conditions.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'af4a8a64-91f6-4ca6-a9ea-852409b0d4c5' AND (description IS NULL OR description = '');

-- Western DuPage Special Recreation Association
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; boccia. Athletes served: Children, teens and adults with physical disabilities or visual impairments, including veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '816e8345-d7b6-4952-97c6-0dbadb1b6626' AND (description IS NULL OR description = '');

-- Grand Strand Miracle Leagues
UPDATE organizations SET description = 'Sports and activities: Baseball; basketball; cheer; dance; bowling; flag football; golf; soccer; tennis; swim lessons. Athletes served: Individuals with disabilities, with a buddy for each player.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '05f17dfe-984d-40bb-85e9-33e0f119333b' AND (description IS NULL OR description = '');

-- Waypoint Adventure
UPDATE organizations SET description = 'Sports and activities: Hiking; ropes course; rock climbing; kayaking; canoeing; snowshoeing; tandem cycling; backpacking. Athletes served: People with intellectual, physical and social emotional disabilities, from moderate to severe.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ada2ce78-640d-4c7a-b157-0f226645e35b' AND (description IS NULL OR description = '');

-- Team River Runner - Fort Belvoir
UPDATE organizations SET description = 'Sports and activities: Kayaking; paddle sports. Athletes served: Veterans, their families and friends.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ef87e9ba-fc79-4631-8c99-c8b4eafece62' AND (description IS NULL OR description = '');

-- Bay Area Outreach & Recreation Program
UPDATE programs SET description = 'Sports and activities: Wheelchair basketball; wheelchair rugby; power soccer; goalball; pickleball; cycling; kayaking; climbing; fitness; outdoor adventures. Athletes served: Youth and adults with mobility and vision disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '349cac28-0917-4bc5-8d55-495825ed20ba' AND (description IS NULL OR description = '');

-- Southeastern Wisconsin Adaptive Ski Program
UPDATE programs SET description = 'Sports and activities: Alpine skiing; snowboarding. Athletes served: People with all types of disabilities, including physical disabilities, brain injury, intellectual disability, autism, blind or low vision, and Deaf or hard of hearing.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f6dad335-a0e3-4daf-a2e1-2de726f0f8f7' AND (description IS NULL OR description = '');

-- SportsAbility Alliance (Florida Disabled Outdoors Association)
UPDATE programs SET description = 'Sports and activities: Baseball; tennis; kickball; fishing; adaptive sports expos. Athletes served: People of all ages and all disabilities, children and adults, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e209699b-0753-4d25-972e-d3905c8942b2' AND (description IS NULL OR description = '');

-- Achilles Arkansas
UPDATE programs SET description = 'Sports and activities: Running; walking; cycling; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injuries and traumatic brain injuries, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd139c166-6138-4873-a341-4e6adf6dd7fe' AND (description IS NULL OR description = '');

-- Achilles Chicago
UPDATE programs SET description = 'Sports and activities: Running; walking; cycling; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, lower limb differences, multiple sclerosis, cerebral palsy, spinal cord injuries and traumatic brain injuries, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ad38ec0c-b2f6-4b09-853f-7b2c17dea322' AND (description IS NULL OR description = '');

-- Achilles Charlotte
UPDATE programs SET description = 'Sports and activities: Running; walking; cycling; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injuries and traumatic brain injuries, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6b4744c7-021c-48f1-ab47-65f8910505db' AND (description IS NULL OR description = '');

-- Achilles Utah
UPDATE programs SET description = 'Sports and activities: Running; walking; cycling; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injuries and traumatic brain injuries, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '05a963bc-6453-40eb-bc4e-d17a663b9171' AND (description IS NULL OR description = '');

-- Achilles Pikes Peak
UPDATE programs SET description = 'Sports and activities: Running; walking; cycling; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injuries and traumatic brain injuries, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3fa17519-43c7-50ed-bc73-20fb38f50b4a' AND (description IS NULL OR description = '');

-- Adaptive Adventures Paralympic Sport Front Range
UPDATE programs SET description = 'Sports and activities: Skiing; snowboarding; cycling; dragon boat racing; kayaking; paddleboarding; rock climbing; waterskiing; wakeboarding; whitewater rafting. Athletes served: Children and youth ages 6 to 20 and adults with physical disabilities, injured veterans and active duty military, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c19c444c-afa1-42e7-adbf-0014894c4151' AND (description IS NULL OR description = '');

-- Access Mammoth
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; Nordic skiing; snowboarding; kayaking; paddleboarding; mountain biking; road cycling; hiking. Athletes served: Kids, adults and seniors of all abilities, including people with physical, sensory or cognitive disabilities, and injured, ill or wounded veterans and service members.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b1928916-d445-48f1-8995-d30ce0993cd0' AND (description IS NULL OR description = '');

-- Adaptive Climbing Group
UPDATE organizations SET description = 'Sports and activities: Indoor climbing; outdoor climbing; youth climbing; competitive paraclimbing. Athletes served: Children and adults with permanent physical, mental or developmental disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7e241540-104c-42a6-afe7-515145384cb9' AND (description IS NULL OR description = '');

-- Adaptive Sports Association – Durango
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding; overnight camping; cycling; canoeing; kayaking; whitewater rafting; indoor rock climbing. Athletes served: Children and adults with cognitive and physical disabilities, and military veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'db87d0ad-5c36-4084-a0ce-6a6b896c2fde' AND (description IS NULL OR description = '');

-- Adventure Amputee Camp
UPDATE organizations SET description = 'Sports and activities: Whitewater rafting; ropes courses; zip lining; water skiing; snow skiing; snowboarding; tubing; swimming; scuba diving; adaptive cycling; tennis; basketball; yoga; ice skating. Athletes served: Children ages 8 to 17 with amputations or limb differences.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f1963571-1ec3-49f6-ab77-ddfd6c762d6f' AND (description IS NULL OR description = '');

-- Arizona Disabled Sports – Paralympic Sport Mesa
UPDATE organizations SET description = 'Sports and activities: Archery; bowling; cycling; kayaking; power soccer; swimming; track and field; goalball; air rifle; adaptive dance; pickleball; bocce; basketball; golf; floor hockey; cheerleading; soccer; paddleboarding; hiking. Athletes served: Athletes ages 6 and up with physical disabilities, including cerebral palsy, spinal cord injury, spina bifida, amputation, traumatic brain injury, muscular dystrophy and visual impairment, and people ages 8 and up with intellectual or developmental disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '549a71f6-5100-4536-b6dc-7c1993d8cda7' AND (description IS NULL OR description = '');

-- Break The Barriers, Inc.
UPDATE organizations SET description = 'Sports and activities: Aquatics; archery; dance; aerial silks; gymnastics; tumbling; martial arts; parkour; trampoline; cheer; health and fitness. Athletes served: Children and adults of all abilities and ages, including veterans and active duty military.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6d640a0e-d51d-4b1c-a733-c58e62d57414' AND (description IS NULL OR description = '');

-- Capital Rowing Club – Paralympic Sport Washington, D.C.
UPDATE organizations SET description = 'Sports and activities: Rowing; sculling; sweep rowing. Athletes served: People of all ages and abilities, including rowers with spinal cord injuries, amputations, degenerative diseases, and visual or cognitive impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fc965b14-deff-42d4-9aa0-bd1e73e12723' AND (description IS NULL OR description = '');

-- Challenged Athletes of West Virginia – Mountaineer
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; handcycling; adaptive cycling; whitewater rafting; camping. Athletes served: Children and adults with physical and cognitive disabilities, from age four to senior citizens.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0570c6ef-5821-4693-b576-522f16f9a4e4' AND (description IS NULL OR description = '');

-- City of Chattanooga, Parks & Recreation – Therapeutic Recreation
UPDATE organizations SET description = 'Sports and activities: Recreational therapy programs. Athletes served: Youth and adults with physical, cognitive or emotional disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd84918a6-4305-472a-9c79-22e91e7cb954' AND (description IS NULL OR description = '');

-- City of Pasadena – Verne Cox Center
UPDATE organizations SET description = 'Sports and activities: Fitness classes; swimming; wheelchair sports; wheelchair basketball; community outings; cultural arts; summer day camps; afterschool programs. Athletes served: People ages 5 to 95 with any type of physical or intellectual disability.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e7ca741-5358-427d-a008-87a52ce99f76' AND (description IS NULL OR description = '');

-- C.O.R.E. Centers, LLC
UPDATE organizations SET description = 'Sports and activities: Restorative exercise; personal training; fitness programs. Athletes served: People of all fitness and ability levels, including people with amputations, cerebral palsy, multiple sclerosis, muscular dystrophy, spinal cord injury, spina bifida, stroke, traumatic brain injury and other disabling conditions, and seniors.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '49d51c6b-df0d-42be-8edc-624ca32f9d05' AND (description IS NULL OR description = '');

-- Courage Kenny Rehabilitation Institute – Twin Cities
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; bowling; golf; power soccer; rock climbing; scuba diving; swimming; tennis; track and field; water skiing; wheelchair basketball; wheelchair lacrosse; wheelchair rugby. Athletes served: Youth and adults of all ages and abilities, including injured veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3d82c0f6-0815-4711-b459-2895d8a70602' AND (description IS NULL OR description = '');

-- DC Fire Fighters Burn Foundation
UPDATE organizations SET description = 'Sports and activities: Swimming; boating; ropes courses; archery; arts; skiing; outdoor adventure retreats; peer support. Athletes served: Burn survivors, including children ages 8 to 18, adults and injured firefighters, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b2a57b7b-381f-45b8-aa47-ec913319af19' AND (description IS NULL OR description = '');

-- Disabled Sports USA Los Angeles – The Unrecables
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; sit skiing. Athletes served: People with physical, intellectual, hearing and visual disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '31e332a5-fb00-40f4-ab40-9f974390bc14' AND (description IS NULL OR description = '');

-- Fencing Institute of Texas
UPDATE organizations SET description = 'Sports and activities: Fencing; foil; epee; wheelchair fencing; blind fencing; historical fencing. Athletes served: Youth and adults from age 6 to seniors, including wheelchair fencers and blind fencers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '14c05816-e943-4f39-8632-c8f4e74b6e0b' AND (description IS NULL OR description = '');

-- Fundraise With Your School
UPDATE organizations SET description = 'Sports and activities: School clubs; school presentations; classroom inclusion projects. Athletes served: Schools and students, to include students with physical disabilities in sports.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6305d3df-5f07-496d-815a-26646db90f40' AND (description IS NULL OR description = '');

-- Granite State Adaptive
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; sit skiing; adaptive cycling; handcycling; adaptive riding; para equestrian dressage; hippotherapy; equine assisted activities. Athletes served: Children and adults with disabilities, ages 3 and up, including people with autism, amputations, stroke, spinal cord injury, visual impairment, traumatic brain injury, cerebral palsy, Down syndrome and spina bifida.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6d5655cc-74af-4496-b836-f7b50af515fe' AND (description IS NULL OR description = '');

-- Katie’s Komets
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Youth with lower limb impairments and other physical disabilities in the Philadelphia area.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0a217daa-5f65-4f70-84f2-f2a4b9af2b06' AND (description IS NULL OR description = '');

-- MAPVA Chargers
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Wheelchair basketball players on an NWBA Division I team.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6aa1f37f-14aa-4b58-8891-4eab764756d5' AND (description IS NULL OR description = '');

-- Miami Beach Watersports Center – Paralympic Sport South Florida
UPDATE organizations SET description = 'Sports and activities: Adaptive rowing; para rowing. Athletes served: Athletes with disabilities in South Florida, for recreational and competitive rowing.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c84cfa55-3b53-4c2d-880f-e3c4a4733f15' AND (description IS NULL OR description = '');

-- Milwaukee Recreation Department
UPDATE organizations SET description = 'Sports and activities: Basketball; bocce; bowling; flag football; indoor track and field; soccer; track and field; volleyball. Athletes served: Milwaukee Public Schools students ages 6 to 21 with disabilities, including autism, hearing impairment, intellectual disability, orthopedic impairment and visual impairment.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '92e504de-835e-4f9a-bd87-b17714b7f832' AND (description IS NULL OR description = '');

-- Northeast Disabled Athletic Association – Burlington
UPDATE organizations SET description = 'Sports and activities: Sailing; sled hockey; power soccer; archery; biathlon; bocce; Nordic skiing; handcycling; kayaking; tennis; water skiing; wheelchair basketball. Athletes served: People with physical disabilities in Vermont.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dd9c4b9b-a3d4-4e09-bc88-0c233f5e9adf' AND (description IS NULL OR description = '');

-- Northwest Association for Blind Athletes – Clark County
UPDATE organizations SET description = 'Sports and activities: Indoor rock climbing; bocce; goalball; swimming; aqua aerobics; running and walking; yoga; tai chi; strength training; Zumba; camps. Athletes served: Children, youth and adults of all ages and abilities who are blind or visually impaired.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e0e06400-f216-419f-b6ca-7b0848f6f856' AND (description IS NULL OR description = '');

-- One Chair At A Time
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; track and field; sports wheelchairs for athletes. Athletes served: Wheelchair users in need of sports wheelchairs, including youth athletes.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '27f69b0a-f713-48be-8e2c-685e4796033b' AND (description IS NULL OR description = '');

-- Paradox Sports
UPDATE organizations SET description = 'Sports and activities: Indoor rock climbing; outdoor rock climbing; ice climbing; mountaineering; youth climbing; competitive climbing. Athletes served: Mainly adults with physical disabilities, including amputation or limb difference, blindness, hearing impairment, spinal cord injury, neurological conditions, traumatic brain injury and PTSD, plus youth climbing sessions.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '599d8bab-9a37-4cc4-a103-713f0470b05b' AND (description IS NULL OR description = '');

-- PDX Fencing
UPDATE organizations SET description = 'Sports and activities: Sabre fencing. Athletes served: Youth and adults.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e9949dd-f309-4d91-81d9-1295b4587c3f' AND (description IS NULL OR description = '');

-- Powered to Move
UPDATE organizations SET description = 'Sports and activities: Adapted fitness classes; handcycling; assisted running races; dance; boxing fitness; drumming. Athletes served: People of any age with intellectual, developmental or physical disabilities, including autism, Down syndrome, cerebral palsy and spina bifida.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ec067c07-0840-48e1-8fcb-a1ac55fa35b1' AND (description IS NULL OR description = '');

-- RISE Adaptive Sports – North Texas
UPDATE organizations SET description = 'Sports and activities: Boating; tubing; water skiing; canoeing; kayaking; wakesurfing; wakeboarding; fishing; wheelchair football; wheelchair rugby; camping; handcycling. Athletes served: People with disabilities and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0b225fd8-27c2-4c6a-850a-3a220bb7e366' AND (description IS NULL OR description = '');

-- SoCal Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Handcycling; boccia; hiking; yoga and meditation; basketball; tennis; pickleball; archery; sailing; ice skating; golf; hockey; bowling; wheelchair softball; wheelchair football. Athletes served: People with physical disabilities in Riverside County and other Southern California communities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f7384a71-ef3a-4138-ba9c-9d9cfd45084a' AND (description IS NULL OR description = '');

-- South East Association for Special Parks and Recreation
UPDATE organizations SET description = 'Sports and activities: Power soccer; golf; wheelchair table tennis; wheelchair softball; sled hockey; boccia; goalball; Alpine skiing; athletics; basketball; bocce; bowling; flag football; floor hockey; gymnastics; powerlifting; snowshoeing; soccer; softball; swimming; tennis; volleyball; health and fitness; art; music; day camps. Athletes served: Children, teens and adults with disabilities living in the member park districts, including athletes with physical disabilities and athletes with intellectual disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a33bd5c0-0636-4e53-8b27-76cfbee7ec5e' AND (description IS NULL OR description = '');

-- Special Olympics Hawaii
UPDATE organizations SET description = 'Sports and activities: Basketball; bocce; bowling; flag football; powerlifting; soccer; softball; swimming; track and field; unified sports. Athletes served: Children and adults with intellectual disabilities, and unified partners.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '07b9d5c0-b40e-4593-883f-772ae4749302' AND (description IS NULL OR description = '');

-- Springfield-Greene County Park Board – Springfield
UPDATE organizations SET description = 'Sports and activities: Baseball; bowling; disc golf; accessible bikes; ceramics; chair tai chi; dance; leather stamping. Athletes served: People with disabilities of all abilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bcfeaaa9-caf3-4e2b-8dd7-b0483f4a6f0c' AND (description IS NULL OR description = '');

-- Team River Runner – Asheville
UPDATE organizations SET description = 'Sports and activities: Kayaking; adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '84ba75d8-dd4f-4c43-bd62-8e9fa2c7ad3e' AND (description IS NULL OR description = '');

-- Team River Runner – Bozeman
UPDATE organizations SET description = 'Sports and activities: Kayaking; adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2100bf8f-e03e-4ca8-bc34-a5de81215feb' AND (description IS NULL OR description = '');

-- Team River Runner – Ft. Belvoir
UPDATE organizations SET description = 'Sports and activities: Whitewater kayaking; rafting; inflatable kayaking; pool paddling sessions. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c58043de-aad0-4afb-9082-64c805f0178a' AND (description IS NULL OR description = '');

-- Team River Runner – Northeast Ohio
UPDATE organizations SET description = 'Sports and activities: Kayaking; adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b5ff7dea-51a8-4b34-95bc-805029470258' AND (description IS NULL OR description = '');

-- Team River Runner – St. Louis
UPDATE organizations SET description = 'Sports and activities: Kayaking; whitewater kayaking; paddle sports. Athletes served: Veterans and service members, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cb6e1b97-2dd7-453f-be48-95cd413e578d' AND (description IS NULL OR description = '');

-- Telluride Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; snowshoeing; Nordic skiing; hiking; cycling; rock climbing; lake sports; horseback riding; tennis; racquet sports; fishing. Athletes served: People ages 4 and up with permanent disabilities, of all abilities, and active military and veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3888493f-6271-4d91-8d8e-fbcb0b269f51' AND (description IS NULL OR description = '');

-- The Center for Individuals with Physical Challenges – Tulsa
UPDATE organizations SET description = 'Sports and activities: Adaptive cycling; adaptive climbing; air rifle; boccia; goalball; power soccer; wheelchair softball; wheelchair basketball; wheelchair racing; adaptive fitness; aquatic therapy; yoga; arts and crafts. Athletes served: Youth and adults with physical challenges, and people who are deaf or hard of hearing.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '887e676e-dad9-4ea2-b9e8-b2a64698c48a' AND (description IS NULL OR description = '');

-- Timpany Center, San Jose
UPDATE organizations SET description = 'Sports and activities: Swimming lessons; aqua fitness; land fitness classes; personal training. Athletes served: People of all ages, fitness and ability levels, in a center designed for people with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '268782cb-38e8-4d70-b7df-1fb87927a7a3' AND (description IS NULL OR description = '');

-- Turnstone Center – Fort Wayne
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair rugby; power soccer; sled hockey; track and field; air rifle; boccia; cycling; open gym; camps; fitness and aquatics. Athletes served: Youth ages 5 and up, adults and veterans with physical, visual, intellectual or developmental disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f3450faa-b58f-471b-b8b3-3162641878c7' AND (description IS NULL OR description = '');

-- United States Driving for the Disabled, Inc.
UPDATE organizations SET description = 'Sports and activities: Carriage driving; para equestrian driving. Athletes served: People with physical disabilities in the United States and Canada.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3d041f5b-5619-49f4-b727-505682447b7b' AND (description IS NULL OR description = '');

-- West Suburban Special Recreation
UPDATE organizations SET description = 'Sports and activities: Aquatics; swim team; swim lessons; basketball; bocce; bowling; golf; gymnastics; powerlifting; snowshoeing; softball; track and field; volleyball; sports and fitness; social clubs; day camps; overnight trips. Athletes served: Children and adults of all ages with physical, mental or other disabilities in the partner communities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '88a251a6-26b2-4c84-ac78-e71575baf73b' AND (description IS NULL OR description = '');

-- World Triathlon – Paratriathlon
UPDATE organizations SET description = 'Sports and activities: Paratriathlon (swim, bike, run). Athletes served: Athletes with physical or visual impairments, including wheelchair users.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b5811449-8e99-4366-afeb-254005fcf414' AND (description IS NULL OR description = '');

-- ACCESS of Wilmington
UPDATE organizations SET description = 'Sports and activities: Baseball; adapted fitness; walking club; pickleball; volleyball; adaptive cycling; kayaking; surfing; basketball; field trips. Athletes served: Children and adults with physical, intellectual and invisible disabilities, ages 3 and up, plus veterans with service connected disabilities and first responders.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '07cb76af-0630-4984-b7a6-63f6ba73ed95' AND (description IS NULL OR description = '');

-- North Carolina Adapted Sports
UPDATE organizations SET description = 'Sports and activities: Adaptive cycling; handcycling; climbing; kayaking; swimming; boccia; youth wheelchair basketball. Athletes served: Youth, teens and adults with physical disabilities in the Triangle area.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b5055a83-aa68-400c-8c8d-f8b8c066dc2a' AND (description IS NULL OR description = '');

-- Adaptive Ski Program
UPDATE programs SET description = 'Sports and activities: Alpine skiing; snowboarding; watersports; river rafting; archery; rock climbing. Athletes served: Children and adults with disabilities, with some programs for veterans and for family members and caregivers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7b8db43e-1900-4e92-81e6-3c696a476b21' AND (description IS NULL OR description = '');

-- Lounsbury Adaptive Ski Program
UPDATE programs SET description = 'Sports and activities: Alpine skiing; sit skiing; mono skiing. Athletes served: Children, young adults and adults ages 5 and up with physical and cognitive disabilities, including spinal cord injury, amputation, Down syndrome, spina bifida, cerebral palsy, multiple sclerosis, traumatic brain injury, visual and hearing impairment, autism and developmental delay.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd81f31e3-378f-4dfd-ae0b-aeb85207374e' AND (description IS NULL OR description = '');

-- UCLA Adaptive Programs
UPDATE programs SET description = 'Sports and activities: Wheelchair basketball; adaptive sports and recreation. Athletes served: UCLA students, faculty and staff and Los Angeles community members, with and without disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a7e22239-6e00-4474-94ba-a48558223359' AND (description IS NULL OR description = '');

-- Mecklenburg County Park and Recreation Therapeutic & Inclusive Recreation
UPDATE programs SET description = 'Sports and activities: Therapeutic recreation programs; inclusion services. Athletes served: Youth, teens and adults with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '34f3e363-7b2e-4541-a6fa-0fb305af1d91' AND (description IS NULL OR description = '');

-- Outdoors for All Foundation (WA)
UPDATE programs SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding; Nordic skiing; snowshoeing; adaptive cycling; kayaking; paddle boarding; rock climbing; hiking; camping; river rafting; yoga; day camps. Athletes served: Children and adults with disabilities, including people who use wheelchairs, amputees, and people with balance difficulties, hearing and visual impairments and developmental disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2fd06f8f-be76-5a74-a59d-3c1938157a50' AND (description IS NULL OR description = '');

-- Achilles Greater Phoenix
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; endurance races. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '25dd9849-efb9-4581-bb32-21420ad6e414' AND (description IS NULL OR description = '');

-- Achilles Kansas City
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; endurance races. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cb204da1-7712-4319-a0c9-09cd85965e84' AND (description IS NULL OR description = '');

-- Achilles New Jersey
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; endurance races. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, dwarfism, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e55d73a5-b546-4e21-9914-f1522199f669' AND (description IS NULL OR description = '');

-- Achilles Tucson
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; endurance races. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '86fb6ddd-f719-5aaf-9333-5a3023a3d661' AND (description IS NULL OR description = '');

-- Achilles Austin
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; endurance races. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6399b0b5-f898-5072-9387-098f6d9eb67f' AND (description IS NULL OR description = '');

-- New England Nordic Ski Association, Maine
UPDATE programs SET description = 'Sports and activities: Nordic skiing; para Nordic skiing; sit skiing; rollerskiing. Athletes served: Para Nordic skiers, including sit skiers, standing skiers and skiers with visual impairments, alongside youth and adult Nordic skiers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7badae23-251c-4453-b588-5344a517da56' AND (description IS NULL OR description = '');

-- AccesSport America
UPDATE organizations SET description = 'Sports and activities: Windsurfing; Hawaiian outrigger canoeing; stand up paddling; surfing; kayaking; cycling; soccer; tennis; strength and conditioning; gait training. Athletes served: Children and adults of all disabilities, and veterans facing physical or mental health challenges.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '96261081-78ae-4a03-bf1d-22a6ad1dc2c4' AND (description IS NULL OR description = '');

-- Adaptive CrossFit
UPDATE organizations SET description = 'Sports and activities: Adaptive strength and conditioning. Athletes served: Individuals with traumatic brain injury and/or physical disabilities, including people who use wheelchairs, have limb loss, or are blind.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2af7b089-245e-45fb-9d5b-d389f5f8c6e3' AND (description IS NULL OR description = '');

-- Adaptive Sports Iowa – Central Iowa
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; beep baseball; cycling; sled hockey; track and field; wheelchair tennis; airgun; adaptive fitness; kayaking; canoeing; paddleboarding; fishing. Athletes served: Iowans with physical or visual disabilities, from beginners to seasoned athletes, including veterans and youth.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8b905c04-d630-4a6c-8297-a3b3dc90a1dd' AND (description IS NULL OR description = '');

-- All Out Adventures
UPDATE organizations SET description = 'Sports and activities: Kayaking; stand up paddleboarding; canoeing; cycling; pickleball; camping; hiking; cross country skiing; sit cross country skiing; ice skating; sled skating; snowshoeing. Athletes served: People of all ages and abilities, including people with disabilities and their family and friends, people living with acquired or traumatic brain injury, seniors, and veterans; disabilities represented include limb difference, autism, blindness or low vision, multiple sclerosis, spinal cord injury, Parkinson''s, and intellectual disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '38e161d3-36c3-46c8-9e66-358c63c44692' AND (description IS NULL OR description = '');

-- Auburn University Office of Accessibility – Paralympic Sport Auburn
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair tennis; power soccer. Athletes served: College student athletes with disabilities, plus a youth wheelchair basketball camp for ages 12 to 19 with a permanent lower extremity disability.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5566bec2-14f8-4e08-90ce-c826298e7ac4' AND (description IS NULL OR description = '');

-- Bicycling Blind Los Angeles
UPDATE organizations SET description = 'Sports and activities: Tandem cycling; online stoker meetups. Athletes served: Blind and visually impaired cyclists who ride as stokers, and the sighted tandem captains who ride with them.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7f7af9f3-efb2-4858-8afe-c47b5aa5cdf1' AND (description IS NULL OR description = '');

-- Brooks Rehabilitation Adaptive Sports and Recreation – Jacksonville
UPDATE organizations SET description = 'Sports and activities: Cycling; yoga; rugby; bowling; skeet shooting; bocce; horseback riding; kayaking; ice skating; golf; dance. Athletes served: People of all ages living with physical, cognitive, neurological, developmental or visual disabilities, including youth from newborn to 17.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '98298c40-ec50-4988-84ac-a6dc6517c684' AND (description IS NULL OR description = '');

-- Catch A Lift
UPDATE organizations SET description = 'Sports and activities: Personalized fitness training; nutrition coaching; wellness programming; peer support community. Athletes served: Post 9/11 combat injured veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '82f303e4-73db-47a6-b61d-c113044f8531' AND (description IS NULL OR description = '');

-- Charles T. Sitrin Health Care Center
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; biathlon; curling; adaptive paddling; wheelchair road racing; air rifle shooting. Athletes served: People with physical disabilities, at recreational and Paralympic levels.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9f602c7a-fd1e-4592-b39f-680b2b4927eb' AND (description IS NULL OR description = '');

-- Cincinnati Recreation Commission
UPDATE organizations SET description = 'Sports and activities: Therapeutic recreation programs; inclusion support in city recreation programs. Athletes served: Individuals with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5c54c566-679d-44e2-af88-91389c727c39' AND (description IS NULL OR description = '');

-- City of Phoenix Adaptive Recreation (Daring Adventures)
UPDATE organizations SET description = 'Sports and activities: Bowling; cheerleading; adaptive cooking classes; summer camp. Athletes served: Individuals with intellectual and physical disabilities, including youth ages 8 to 16 at summer camp.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c0053e7-479f-415f-97ac-1c277cffac95' AND (description IS NULL OR description = '');

-- Craig Hospital Paralympic Sports
UPDATE organizations SET description = 'Sports and activities: Recreational therapy; paddleboarding; cycling; kayaking; nature hikes; gardening; adventure travel and outdoor recreation. Athletes served: Patients and former patients with spinal cord injury, brain injury or nervous system injury, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'acb82e31-821b-4f82-b99b-2b0671c2d953' AND (description IS NULL OR description = '');

-- Georgia Blind Sports Association
UPDATE organizations SET description = 'Sports and activities: Goalball; beep baseball; blind soccer; kayaking; tandem cycling; audio darts. Athletes served: Blind and visually impaired youth and adults; youth players at least 13 years old.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ecc745d4-058f-4cb7-bd01-6499bcbf7211' AND (description IS NULL OR description = '');

-- Great Plains Chapter Paralyzed Veterans of America
UPDATE organizations SET description = 'Sports and activities: Adapted fitness; wheelchair bowling; air guns; archery; billiards; table tennis; power soccer; golf; youth art camp. Athletes served: Paralyzed veterans and other adults and children living with a disability, including people with spinal cord injury or multiple sclerosis; youth art camp for ages 6 and up with a physical disability.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '150519ca-3efc-4ebe-b835-b5f802d1973e' AND (description IS NULL OR description = '');

-- Heroes On The Water – DFW Chapter
UPDATE organizations SET description = 'Sports and activities: Kayak fishing; kayaking; family outdoor events. Athletes served: U.S. active duty military, veterans, law enforcement officers, first responders and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e4beeeed-0b37-4aa1-82d8-487a50a56a69' AND (description IS NULL OR description = '');

-- Ignite Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Downhill skiing; cross country skiing; snowboarding; snowshoeing; sit skiing; ski biking. Athletes served: People of all ages with disabilities in the Front Range of Colorado, including veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'efe5ec4d-05ba-4328-813b-ad6440c1b50a' AND (description IS NULL OR description = '');

-- Kennedy Krieger Institute – Bennett Institute Sports
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; ambulatory basketball; baseball; boccia; motor development and swim; power soccer; sailing; sled hockey; swimming; tennis; track and field; wheelchair floor hockey; soccer; football; lacrosse; golf. Athletes served: Children and teens ages 2 to 18 with physical disabilities, with some adult teams in sled hockey, swimming, track and wheelchair basketball.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fc8eec3d-b563-4755-adb0-ee81d1ef3cba' AND (description IS NULL OR description = '');

-- Lakeshore Foundation – Paralympic Sport Birmingham
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; power soccer; swimming; track and field; wheelchair rugby; boccia; para powerlifting; wheelchair football; wheelchair tennis; pickleball; adapted cycling; air rifle; archery; aquatics and fitness classes. Athletes served: Youth and adults with a wide range of physical disabilities and chronic health conditions, plus injured military, veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b8a8f78f-8b58-4638-a46f-afa4b5a6f96b' AND (description IS NULL OR description = '');

-- Louisiana GUMBO Inc – Paralympic Sport Louisiana
UPDATE organizations SET description = 'Sports and activities: Track and field. Athletes served: Children and adults ages 5 and up with physical, visual, hearing or intellectual disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '72e41bee-bca5-45c5-b3b7-37b5bf57dc7c' AND (description IS NULL OR description = '');

-- Marty Turcios Therapeutic Golf Foundation
UPDATE organizations SET description = 'Sports and activities: Adaptive golf; therapeutic golf clinics. Athletes served: Children, adults and veterans living with disabilities or recovering from injury.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '550348c7-fe9d-4c2d-9e8d-cb061536ad9e' AND (description IS NULL OR description = '');

-- Nashville Rowing – Freedom Rows
UPDATE organizations SET description = 'Sports and activities: Adaptive rowing; para rowing. Athletes served: Disabled veterans and members of the military, with para rowing open to people of all ages and abilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a592d06a-86da-4293-83a6-c61996142f37' AND (description IS NULL OR description = '');

-- Northeast DuPage Special Recreation Association
UPDATE organizations SET description = 'Sports and activities: Basketball; bocce; bowling; ice skating; floor hockey; golf; gymnastics; powerlifting; soccer; snowshoeing; softball; swimming; tennis; track and field; boccia; cultural arts; camps; veteran fitness and personal training. Athletes served: Youth and adults with intellectual disabilities, autism, physical disabilities and visual impairments, and veterans transitioning to civilian life.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '460d2164-873f-4901-924f-4ae5a59b653b' AND (description IS NULL OR description = '');

-- Operation Rebound
UPDATE organizations SET description = 'Sports and activities: Adaptive sports grants for equipment, competition and training; surf therapy. Athletes served: U.S. veterans, active duty military, law enforcement officers, firefighters and paramedics with permanent physical disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7780080a-8a32-4fd2-b510-a9ed782c82fc' AND (description IS NULL OR description = '');

-- Paralyzed Veterans of America
UPDATE organizations SET description = 'Sports and activities: Air guns; bass fishing; billiards; boccia; bowling; football; online programs; outdoors; paracycling; pickleball; trapshooting; wheelchair basketball; wheelchair rugby. Athletes served: Paralyzed and disabled veterans, including veterans living with spinal cord injury or disease, and their families and caregivers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6d4a554e-4011-438d-823d-e1b9468c59af' AND (description IS NULL OR description = '');

-- Pennsylvania Center For Adapted Sports – Philadelphia
UPDATE organizations SET description = 'Sports and activities: Birding; climbing; cycling; indoor rowing; kayaking; rowing; sitting volleyball; skiing; snowboarding; triathlon; yoga; pickleball; swimming; track and field; virtual programs. Athletes served: Children and adults with disabilities, with a focus on veterans and young athletes.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '94a8261c-acb2-4b2c-85f0-1099dbed8f9e' AND (description IS NULL OR description = '');

-- Sea Scout Base Galveston Community Sailing
UPDATE organizations SET description = 'Sports and activities: Sailing; power boating; kayaking; fishing; adaptive sports. Athletes served: All people, especially youth, through adaptive sports and veterans programs.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f4df1f40-2a04-488a-b418-3d52f18dfa60' AND (description IS NULL OR description = '');

-- Shared Adventures Edited after approval: "families who have a child with a disability" -> "families of children with disabilities" (the site reads "a child" as an internal note and would hide the text).
UPDATE organizations SET description = 'Sports and activities: Kayaking; outrigger canoeing; scuba diving; beach wheelchair rides; rock climbing; archery; family camp. Athletes served: People of all ages living with physical and/or developmental disabilities, and families of children with disabilities ages 5 to 25.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dbfc2e34-9b01-4197-9ec5-5246f1e58197' AND (description IS NULL OR description = '');

-- Southern Arizona Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Wheelchair softball; wheelchair basketball; wheelchair tennis; adaptive cycling; junior wheelchair sports; adaptive sports in schools. Athletes served: Children and adults with disabilities, at recreational and competitive levels.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '35563812-9b64-4df7-9b19-6f87c0cbb6e9' AND (description IS NULL OR description = '');

-- Special Olympics Illinois
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; artistic gymnastics; track and field; basketball; bocce; bowling; cornhole; equestrian; flag football; floor hockey; golf; powerlifting; rhythmic gymnastics; snowshoeing; soccer; softball; swimming; tennis; volleyball. Athletes served: Children and adults with intellectual disabilities, ages 8 and up in traditional sports and ages 2 to 7 in the young athletes program, plus unified partners without disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1ad63975-35c3-485b-869b-a3c4ae346a15' AND (description IS NULL OR description = '');

-- Team River Runner Ft. Carson/Colorado Springs
UPDATE organizations SET description = 'Sports and activities: Sea kayaking; flatwater paddling; stand up paddleboarding; whitewater paddling; rafting. Athletes served: Active duty service members, veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c0b85653-26df-4309-bc45-e9e341f30a71' AND (description IS NULL OR description = '');

-- Team River Runner Menlo Park & Palo Alto
UPDATE organizations SET description = 'Sports and activities: Pool kayak instruction; sea kayaking; flatwater paddling; whitewater paddling; stand up paddleboarding; rafting. Athletes served: Active duty service members, veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '905b79f2-c5e7-4424-84f9-f4acf0b28dbc' AND (description IS NULL OR description = '');

-- Teton Adaptive Sports, Inc.
UPDATE organizations SET description = 'Sports and activities: Biking; paddling; paragliding; sailing; skiing; sled hockey; swimming; kids skiing; yoga. Athletes served: People with disabilities living in and visiting the Greater Teton Area, including kids.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2491dea6-5b14-4189-8fa4-28d2bafd01da' AND (description IS NULL OR description = '');

-- Therapeutic Adventures – Blue Ridge/Shenandoah
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; archery; backpacking; camping; canoeing; curling; cycling and hand cycling; fitness and conditioning; fly fishing; Nordic skiing; pickleball; racquetball; rock climbing; rowing; sailing; sea kayaking; shooting sports; sled hockey; snowboarding; snowshoeing; stand up paddleboarding; surfing; swimming; track and field; waterskiing; whitewater kayaking; wheelchair basketball; wheelchair tennis; yoga. Athletes served: People of all ages and abilities, including those with physical, developmental and intellectual disabilities, mental health conditions, and chronic or complex medical conditions.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e5a88309-4937-409c-80d5-cb4d08bc2155' AND (description IS NULL OR description = '');

-- United States Equestrian Federation
UPDATE organizations SET description = 'Sports and activities: Para dressage; para driving. Athletes served: Riders and drivers with physical disabilities, including disabled veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'da4bc284-5c3f-406f-a11d-7907fcbd0e71' AND (description IS NULL OR description = '');

-- University of Texas Arlington – Movin’ Mavs
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; adapted track and field; adapted recreation; camps and clinics. Athletes served: UTA students with disabilities, plus student allies without disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e3e2baf-0123-41bc-b739-78a59a05fe30' AND (description IS NULL OR description = '');

-- VETSports
UPDATE organizations SET description = 'Sports and activities: Softball; football; hockey; golf; volleyball; running; healthy living and fitness. Athletes served: Veterans, with healthy living resources also open to first responders, military and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f3116ece-0e86-4bb9-97ff-e4cd65d39ec3' AND (description IS NULL OR description = '');

-- Wheelchair & Ambulatory Sports, USA
UPDATE organizations SET description = 'Sports and activities: Archery; track and field; powerlifting; shooting; swimming; table tennis. Athletes served: Youth and adults with physical disabilities, both wheelchair users and ambulatory athletes.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4264bf7e-2035-479a-b819-2b009306dbc3' AND (description IS NULL OR description = '');

-- Patriots for Disabled Divers
UPDATE organizations SET description = 'Sports and activities: Scuba diving. Athletes served: People with disabilities, especially disabled veterans, including people with PTSD, autism, paraplegia, quadriplegia and traumatic brain injury; also programs for caregivers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '15dc9565-45bb-41c3-b887-c76fad9b1678' AND (description IS NULL OR description = '');

-- Chesapeake Region Accessible Boating (CRAB)
UPDATE organizations SET description = 'Sports and activities: Therapeutic sailing; family sails; group sails; radio controlled sailing; regattas; adaptive fishing. Athletes served: People with any disability, including cerebral palsy, deafness, Down syndrome, muscular dystrophy, blindness, autism, PTSD, brain injury, limb difference, paraplegia, quadriplegia and stroke, plus older adults, recovering warriors and youth from underserved communities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dc9aa62d-7be8-42bf-8e98-3a26d8e7f433' AND (description IS NULL OR description = '');

-- Adaptive Sports Program New Mexico
UPDATE programs SET description = 'Sports and activities: Skiing; snowboarding; watersports; river rafting; archery; rock climbing. Athletes served: Children and adults with disabilities, including veterans, with some programs open to family members and caregivers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'df8fbabf-3b90-444d-9fd6-aa94d5327492' AND (description IS NULL OR description = '');

-- Universal Access Program – Statewide
UPDATE programs SET description = 'Sports and activities: Adaptive rowing; tandem cycling; adaptive hiking; accessible beaches and skating rinks with adaptive equipment. Athletes served: Visitors of all abilities to Massachusetts state parks.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c99c6f55-ad7f-40d8-b43b-3681145918e3' AND (description IS NULL OR description = '');

-- COSTA Therapy, Inc.
UPDATE programs SET description = 'Sports and activities: Adaptive surf therapy. Athletes served: Veterans, first responders and service members.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9387cdc7-581e-429e-8945-bd6cef88141f' AND (description IS NULL OR description = '');

-- Outdoors For All Foundation (OR)
UPDATE programs SET description = 'Sports and activities: Downhill skiing; Nordic skiing; snowshoeing; cycling; hiking; camping; river rafting; kayaking; rock climbing; day camps; yoga. Athletes served: Children and adults with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3178a800-7371-420f-b6be-0afb0423fb45' AND (description IS NULL OR description = '');

-- Achilles Los Angeles
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; cycling; endurance races. Athletes served: People of all ages living with a disability, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f236d283-bb97-4833-b840-339c486dd1f4' AND (description IS NULL OR description = '');

-- Achilles Boston
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; cycling; endurance races. Athletes served: People of all ages living with a disability, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c3883b66-e01f-4dda-a1e0-5d4f7f64a6e7' AND (description IS NULL OR description = '');

-- Achilles Las Vegas
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; cycling; endurance races. Athletes served: People of all ages living with a disability, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '65ae1bed-e304-4af2-93e8-05f9ac656446' AND (description IS NULL OR description = '');

-- Achilles San Diego
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; cycling; endurance races. Athletes served: People of all ages living with a disability, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e11d381c-9800-5d8e-ad61-3e9c0c5578f7' AND (description IS NULL OR description = '');

-- Achilles Long Island
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; cycling; endurance races. Athletes served: People of all ages living with a disability, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '67aada0e-260d-5a23-9595-cf776952e3a1' AND (description IS NULL OR description = '');

-- New England Nordic Ski Association, Vermont
UPDATE programs SET description = 'Sports and activities: Para Nordic skiing; sit skiing; learn to ski clinics. Athletes served: Para Nordic skiers, including sit skiers, standing skiers and skiers who are visually impaired.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cdb70473-8e29-4e4f-9502-cba4dbed338d' AND (description IS NULL OR description = '');

-- Breckenridge Outdoor Education Center (BOEC) (already listed; its approved description goes on the existing row).
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; snowshoeing; ski biking; rafting; rock climbing; hiking; cycling; canoeing; camping; high ropes course. Athletes served: Adults and children of all ability levels with physical and cognitive disabilities and sensory differences, including brain injury, multiple sclerosis, Parkinson''s disease, spinal cord injury and autism, and veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'eaacb362-f349-4e89-8391-31a667802fa0' AND (description IS NULL OR description = '');

-- National Sports Center for the Disabled (NSCD) (already listed; its approved description goes on the existing row).
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; ski biking; Nordic skiing; snowshoeing; fat tire snow biking; rock climbing; archery; air rifle; horseback riding; mountain biking; canoeing; kayaking; paddleboarding; sailing; whitewater rafting; hiking. Athletes served: Youth, teens, and adults with any type of disability, including veterans and active duty military living with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f3488136-f4f5-46c9-936d-0c7a794621f0' AND (description IS NULL OR description = '');

-- Colorado Discover Ability (already listed; its approved description goes on the existing row).
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; cycling; rafting; kayaking; stand up paddleboarding; hiking; sled hockey; disc golf; horseback riding. Athletes served: Children and adults ages 4 and up with physical and cognitive disabilities, athletes with intellectual disabilities, families, and veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '63c9e62b-c605-4b14-bfcd-25a3ccb00078' AND (description IS NULL OR description = '');

-- Wasatch Adaptive Sports (already listed; its approved description goes on the existing row).
UPDATE organizations SET description = 'Sports and activities: Skiing; snowboarding; sit skiing; cycling; indoor cycling; mountain biking; paddle sports; yoga. Athletes served: People with disabilities in Utah, including veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '529488d7-efee-4db0-84d6-cd3039bffdd6' AND (description IS NULL OR description = '');

-- Adaptive Sports Partners of the North Country (already listed; its approved description goes on the existing row).
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; mountain biking; hiking; biking; Nordic skiing; rock climbing; swimming; gardening; bocce and boccia; golf; disc golf; bowling; kayaking; fly fishing; sailing. Athletes served: Athletes of all ages with physical, developmental, emotional, and behavioral disabilities in northern New Hampshire and Vermont''s Northeast Kingdom.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b554b41e-d820-47e6-bb3e-7481e28b4054' AND (description IS NULL OR description = '');

-- Summit Adaptive Sports (already listed; its approved description goes on the existing row).
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; Nordic skiing; snowboarding; sit skiing; hiking; kayaking; stand up paddleboarding; mountain biking; cross country biking; disc golf. Athletes served: Individuals with disabilities, including autism, ADHD, blind or low vision, deaf or hard of hearing, cerebral palsy, intellectual disability, traumatic brain injury, spinal cord injury, PTSD, anxiety and limb loss.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b7696d70-50f0-44e7-b979-64c3113a044d' AND (description IS NULL OR description = '');

-- Keystone Adaptive Center
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding. Athletes served: People with disabilities, including people who are blind or have low vision, autism, and learning delays, plus military ski and snowboard camps.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8ab489cb-07bc-4de8-9378-0e2af738ac90' AND (description IS NULL OR description = '');

-- Capital Region Nordic Alliance
UPDATE organizations SET description = 'Sports and activities: Biathlon; orienteering; snowshoeing; cross country skiing; Paralympic Nordic skiing. Athletes served: Veterans, adults and youth with disabilities, alongside the wider community.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'facba626-fdbd-4bb0-b7f2-06f383fad46f' AND (description IS NULL OR description = '');

-- Kinetic Kids – San Antonio
UPDATE organizations SET description = 'Sports and activities: Baseball; basketball; wheelchair basketball; soccer; swimming; tennis; track and field; archery; gymnastics; cheerleading; dance; flag football; golf; lacrosse; martial arts; pickleball; rock climbing; skateboarding; snow skiing; volleyball; cycling; fine arts. Athletes served: Children with disabilities, including those with spina bifida, autism and Down syndrome and those who use crutches, walkers or wheelchairs.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a10b1e03-2223-4db7-bdd9-79a067d99f60' AND (description IS NULL OR description = '');

-- Helen Woodward Animal Center Therapeutic Riding
UPDATE organizations SET description = 'Sports and activities: Therapeutic riding; equine assisted activities. Athletes served: Children and adults with disabilities, ages 4 and up.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fa4f5c71-e175-4fa4-945b-4a4290849f76' AND (description IS NULL OR description = '');
