-- One-time import of the official Dalal Street roster (73 teams) plus BIG BULL as Team 1.
-- Existing financial histories are preserved; only roster identity/assignment and active flags change.
INSERT INTO broker_roster_aliases(broker_number,broker_code,broker_name,internal_broker_id)
SELECT 11,'SIDDHARTH','SIDDHARTH',id FROM brokers WHERE code='BROKER-11'
ON CONFLICT (broker_number) DO UPDATE SET broker_code=EXCLUDED.broker_code,
 broker_name=EXCLUDED.broker_name,internal_broker_id=EXCLUDED.internal_broker_id;

WITH raw AS (
 SELECT line, ord FROM unnest(string_to_array($roster$Apala|Vidura|K + K|Krishnangshu Sarkar / Gourav V Rao
Dignaga|Vidura|D + A|Karanam Seebivamsikrishna / Shreya C
Kanada|Vidura|O + O|Juhi Moudekar / Sidharrth Rao
Kapila|Vidura|I + I|Swaroop Rao T / Rohit B
Khana|Vidura|J + J|Yuvaraj Suresh Bangera / Neeraj Kamath
Matanga|Vidura|O + O|Shraddha Yadav / Chinmay B Arya
Vagbhata|Vidura|C + M|Manisha Raj / Suhas vardhan
Artha|Yash|M + D|Likitesh / Lakshna. S
Dhriti|Yash|I + I|Jothish N / S S S Surya
Kosh|Yash|L + L|Bhoomika Venkatachala Bhat / Mitali Basavaraj Devagi
Mangala|Yash|F + F|Vishal Bhaskaran / A Tarakeshwar
Nishtha|Yash|E + E|Thamizh Selvan E / Sri viswanath
Nyaya|Yash|D + D|LIJIN LAKSHMANAN / Albin Sanjay P
Rajat|Yash|P + P|Greeshma R / Disha M
Valabhi|Yash|F + F|Aishwarya B M / Poorvitha
Koshya|Ganita|O + O|Drushya A / Supreeth Shekar S
Madhava|Ganita|N + N|Ajay M / PRANAV S R
Panini|Ganita|L + L|Arundhathy V Nambi / Aakash Darsan P M
Sangita|Ganita|P + P|Pasupathi R / R Megha
Sutra|Ganita|M + M|Joshiya J / Indhu Shree Raj Kumar
Virahanka|Ganita|N + M|Mohammed Riyaz / Arshiya Kausar
Yukti|Ganita|H + J|Koushik Gali / Kumar Vayur
Abhyasa|Prajna|R + R|Tanish Milind Salunkhe / John Tophy
Ghosha|Prajna|C + C|SHASWAT AGRAWAL / Mohammed Haseeb Ahmed
Jaya|Prajna|K + K|Shreya j hegde / Nidhi shetty
Jya|Prajna|N + N|Rion Dsouza / Suraj
Shree|Prajna|N + N|Rohan J / Abishek R
Utsaha|Prajna|M + M|K PRANAVI / DARUNIKA R
Viveka|Prajna|M + M|Aaditya Mehra / Madiya Mehraj
Bhamaha|Madhava|K + K|Muhammad Irfan / Kumaraguru
Kuttaka|Madhava|P + P|Kunj Punith Kumar Maru / Raunak Bajaj
Lopamudra|Madhava|K + B|Varun Nayak / Satvik B Bellad
Medha|Madhava|D + D|Pulagam hasini / Anusha dumpala
Nirukta|Madhava|Q + Q|Hem b davey / Ramcharan
Nivesh|Madhava|A + A|K S Monish Kumar / Guruprasad V
Vasubandhu|Madhava|K + L|Bhoomika GS / M.Madhu vandhan
Vyaya|Madhava|L + L|Yoga Shree R R / Janani Suresh
Avvaiyar|Amrit|P + P|Anusha V Bhat / VIJAY ANANTH J
Dhan|Amrit|D + D|Abhishek Nagori / Advaith R
Halayudha|Amrit|G + G|Lithin H Raju / Tarun P
Maitreyi|Amrit|P + P|Mohammad Saif / Anirudh Rao
Mithila|Amrit|D + D|Sourabh Toppo / Ramkrishna Kamlakar Rao
Nilakantha|Amrit|L + L|Sri Seshasaini G / Sadhana B
Tanka|Amrit|J + J|Nichhanametla Harshita / Prachi kashyap
Charaka|Arohan|J + J|Kartik Revankar / Payal manna
Kautilya|Arohan|F + F|Mohammed Farhan Ulla / Aviral Singh
Kriya|Arohan|K + K|Soham Organtiwar / Shikhar Sampann
Labhya|Arohan|N + G|Siddannagari Reddeppa Reddy Nandini / Tallapalle Sai Vyshnavi
Mudra|Arohan|H + H|Mohammed raza / Ashit singla
Nidhi|Arohan|F + F|Prajwal M Bharadwaj / Samyak Shrivastav
Sridhara|Arohan|G + G|Almeera S / Sugumaran
Akshaya|Suvarna|L + L|Devansh Srivastava / Shreya Shukla
Aryabhata|Suvarna|I + O|Swaroop mahadev pujari / Gayana N
Aryadeva|Suvarna|B + B|Aashish Reddy / Kailesh b
Dandin|Suvarna|Q + I|Manjunath Gaddad / Midhat Rahman
Sushruta|Suvarna|D + D|Arsha.P.R / Harini S M
Tantra|Suvarna|O + O|Mohammed Samadul Zain S / Shivam Periwal
Vastu|Suvarna|D + D|Shraddha Dey / Pamela Pramanick
Chandas|Kalidasa|M + M|Mohammed Riyaz K / Manisha Kumari
Kamandaka|Kalidasa|M + Q|Srishti sinha / Ashmeet kaur
Munjala|Kalidasa|A + A|Lokesh P / MALLAMMA BASAVARAJ NITALI
Sankalpa|Kalidasa|F + M|DAKSHATA C A / SURYAPRAKASH V
Shilpa|Kalidasa|L + L|Azwath Roshan / Rithika B
Vidura|Kalidasa|C + C|Tejas Thimmaiah / Tushar Biswas
Vriddhi|Kalidasa|J + J|Kiran prasaath / Balaji T
Jaimini|Vikas|N + N|Astha Jain / K M Prajwal
Labh|Vikas|L + L|Aditya raj / Abhijit Chakraborty
Neeti|Vikas|B + B|SESHATHRI BALAN G / Sasi Naga Kiran Godavarthi
Neetiya|Vikas|L + L|RAHUL TL / Shriharan RK T
Pingala|Vikas|E + E|Praveen / Rahul Kunar
Pramana|Vikas|K + K|Tanushka Rajesh Chugh / Prince Raj
Rupa|Vikas|F + J|Ashutosh Padhy / Swayam Sahu
Shiksha|Vikas|M + M|Samhita hegde / D ABHIRAMA SHASTRY$roster$, E'\n')) WITH ORDINALITY AS x(line,ord)
 WHERE btrim(line)<>''
), roster AS (
 SELECT ord::integer+1 AS team_no, split_part(line,'|',1) AS name,
  split_part(line,'|',2) AS broker_code, split_part(line,'|',3) AS section,
  split_part(line,'|',4) AS members FROM raw
)
INSERT INTO team_name_pool(name,category,meaning,active)
SELECT r.name,'ROSTER','Official Dalal Street 2026 participant team',true
FROM roster r WHERE NOT EXISTS (SELECT 1 FROM team_name_pool p WHERE lower(p.name)=lower(r.name));

WITH raw AS (
 SELECT line, ord FROM unnest(string_to_array($roster$Apala|Vidura|K + K|Krishnangshu Sarkar / Gourav V Rao
Dignaga|Vidura|D + A|Karanam Seebivamsikrishna / Shreya C
Kanada|Vidura|O + O|Juhi Moudekar / Sidharrth Rao
Kapila|Vidura|I + I|Swaroop Rao T / Rohit B
Khana|Vidura|J + J|Yuvaraj Suresh Bangera / Neeraj Kamath
Matanga|Vidura|O + O|Shraddha Yadav / Chinmay B Arya
Vagbhata|Vidura|C + M|Manisha Raj / Suhas vardhan
Artha|Yash|M + D|Likitesh / Lakshna. S
Dhriti|Yash|I + I|Jothish N / S S S Surya
Kosh|Yash|L + L|Bhoomika Venkatachala Bhat / Mitali Basavaraj Devagi
Mangala|Yash|F + F|Vishal Bhaskaran / A Tarakeshwar
Nishtha|Yash|E + E|Thamizh Selvan E / Sri viswanath
Nyaya|Yash|D + D|LIJIN LAKSHMANAN / Albin Sanjay P
Rajat|Yash|P + P|Greeshma R / Disha M
Valabhi|Yash|F + F|Aishwarya B M / Poorvitha
Koshya|Ganita|O + O|Drushya A / Supreeth Shekar S
Madhava|Ganita|N + N|Ajay M / PRANAV S R
Panini|Ganita|L + L|Arundhathy V Nambi / Aakash Darsan P M
Sangita|Ganita|P + P|Pasupathi R / R Megha
Sutra|Ganita|M + M|Joshiya J / Indhu Shree Raj Kumar
Virahanka|Ganita|N + M|Mohammed Riyaz / Arshiya Kausar
Yukti|Ganita|H + J|Koushik Gali / Kumar Vayur
Abhyasa|Prajna|R + R|Tanish Milind Salunkhe / John Tophy
Ghosha|Prajna|C + C|SHASWAT AGRAWAL / Mohammed Haseeb Ahmed
Jaya|Prajna|K + K|Shreya j hegde / Nidhi shetty
Jya|Prajna|N + N|Rion Dsouza / Suraj
Shree|Prajna|N + N|Rohan J / Abishek R
Utsaha|Prajna|M + M|K PRANAVI / DARUNIKA R
Viveka|Prajna|M + M|Aaditya Mehra / Madiya Mehraj
Bhamaha|Madhava|K + K|Muhammad Irfan / Kumaraguru
Kuttaka|Madhava|P + P|Kunj Punith Kumar Maru / Raunak Bajaj
Lopamudra|Madhava|K + B|Varun Nayak / Satvik B Bellad
Medha|Madhava|D + D|Pulagam hasini / Anusha dumpala
Nirukta|Madhava|Q + Q|Hem b davey / Ramcharan
Nivesh|Madhava|A + A|K S Monish Kumar / Guruprasad V
Vasubandhu|Madhava|K + L|Bhoomika GS / M.Madhu vandhan
Vyaya|Madhava|L + L|Yoga Shree R R / Janani Suresh
Avvaiyar|Amrit|P + P|Anusha V Bhat / VIJAY ANANTH J
Dhan|Amrit|D + D|Abhishek Nagori / Advaith R
Halayudha|Amrit|G + G|Lithin H Raju / Tarun P
Maitreyi|Amrit|P + P|Mohammad Saif / Anirudh Rao
Mithila|Amrit|D + D|Sourabh Toppo / Ramkrishna Kamlakar Rao
Nilakantha|Amrit|L + L|Sri Seshasaini G / Sadhana B
Tanka|Amrit|J + J|Nichhanametla Harshita / Prachi kashyap
Charaka|Arohan|J + J|Kartik Revankar / Payal manna
Kautilya|Arohan|F + F|Mohammed Farhan Ulla / Aviral Singh
Kriya|Arohan|K + K|Soham Organtiwar / Shikhar Sampann
Labhya|Arohan|N + G|Siddannagari Reddeppa Reddy Nandini / Tallapalle Sai Vyshnavi
Mudra|Arohan|H + H|Mohammed raza / Ashit singla
Nidhi|Arohan|F + F|Prajwal M Bharadwaj / Samyak Shrivastav
Sridhara|Arohan|G + G|Almeera S / Sugumaran
Akshaya|Suvarna|L + L|Devansh Srivastava / Shreya Shukla
Aryabhata|Suvarna|I + O|Swaroop mahadev pujari / Gayana N
Aryadeva|Suvarna|B + B|Aashish Reddy / Kailesh b
Dandin|Suvarna|Q + I|Manjunath Gaddad / Midhat Rahman
Sushruta|Suvarna|D + D|Arsha.P.R / Harini S M
Tantra|Suvarna|O + O|Mohammed Samadul Zain S / Shivam Periwal
Vastu|Suvarna|D + D|Shraddha Dey / Pamela Pramanick
Chandas|Kalidasa|M + M|Mohammed Riyaz K / Manisha Kumari
Kamandaka|Kalidasa|M + Q|Srishti sinha / Ashmeet kaur
Munjala|Kalidasa|A + A|Lokesh P / MALLAMMA BASAVARAJ NITALI
Sankalpa|Kalidasa|F + M|DAKSHATA C A / SURYAPRAKASH V
Shilpa|Kalidasa|L + L|Azwath Roshan / Rithika B
Vidura|Kalidasa|C + C|Tejas Thimmaiah / Tushar Biswas
Vriddhi|Kalidasa|J + J|Kiran prasaath / Balaji T
Jaimini|Vikas|N + N|Astha Jain / K M Prajwal
Labh|Vikas|L + L|Aditya raj / Abhijit Chakraborty
Neeti|Vikas|B + B|SESHATHRI BALAN G / Sasi Naga Kiran Godavarthi
Neetiya|Vikas|L + L|RAHUL TL / Shriharan RK T
Pingala|Vikas|E + E|Praveen / Rahul Kunar
Pramana|Vikas|K + K|Tanushka Rajesh Chugh / Prince Raj
Rupa|Vikas|F + J|Ashutosh Padhy / Swayam Sahu
Shiksha|Vikas|M + M|Samhita hegde / D ABHIRAMA SHASTRY$roster$, E'\n')) WITH ORDINALITY AS x(line,ord)
 WHERE btrim(line)<>''
), roster AS (
 SELECT ord::integer+1 AS team_no, split_part(line,'|',1) AS name,
  split_part(line,'|',2) AS broker_code, split_part(line,'|',3) AS section,
  split_part(line,'|',4) AS members FROM raw
)
UPDATE teams t SET name=r.name, section=r.section, members=r.members,
 broker_id=a.internal_broker_id, active=true, updated_at=now()
FROM roster r JOIN broker_roster_aliases a ON lower(a.broker_code)=lower(r.broker_code)
WHERE t.seq=r.team_no AND t.seq BETWEEN 2 AND 74;

UPDATE teams SET active=false, updated_at=now() WHERE seq BETWEEN 75 AND 100;
UPDATE teams SET name='BIG BULL', active=true, broker_id=(SELECT id FROM brokers WHERE code='BROKER-11'), updated_at=now()
WHERE seq=1 AND code='TEAM-001';
UPDATE app_users u SET display_name=t.name, active=t.active, updated_at=now()
FROM teams t WHERE u.team_id=t.id AND u.role='PARTICIPANT';
INSERT INTO audit_log(actor_username,actor_role,action,entity,entity_id,details)
VALUES ('roster-migration','ADMIN','OFFICIAL_DALAL_ROSTER_IMPORTED','roster',NULL,
 jsonb_build_object('official_teams',73,'special_participant','1-BIG BULL-11-SIDDHARTH',
 'broker_count',11,'active_team_numbers','1-74','inactive_placeholder_numbers','75-100',
 'financial_history_reset',false,'source','Dalal_Street_Teams(6).xlsx + Dalal_Street_Brokers(5).xlsx'));
INSERT INTO schema_migrations(version) VALUES ('013_dalal_roster');
