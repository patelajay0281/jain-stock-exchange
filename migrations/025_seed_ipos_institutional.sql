INSERT INTO institutional_investors(code,name,cash,available_cash)
SELECT 'INST-01','Institutional Investor',20000000,20000000
WHERE NOT EXISTS (SELECT 1 FROM institutional_investors WHERE code='INST-01');

INSERT INTO ipo_offerings(code,name,symbol,price,available_quantity,remaining_quantity,status)
SELECT 'IPO-01','JSE New Tech','JSETECH',500,100000,100000,'OPEN'
WHERE NOT EXISTS (SELECT 1 FROM ipo_offerings WHERE code='IPO-01');

INSERT INTO ipo_offerings(code,name,symbol,price,available_quantity,remaining_quantity,status)
SELECT 'IPO-02','JSE Green Energy','JSEGREEN',750,80000,80000,'OPEN'
WHERE NOT EXISTS (SELECT 1 FROM ipo_offerings WHERE code='IPO-02');

INSERT INTO ipo_offerings(code,name,symbol,price,available_quantity,remaining_quantity,status)
SELECT 'IPO-03','JSE Consumer','JSECONSUMER',625,120000,120000,'OPEN'
WHERE NOT EXISTS (SELECT 1 FROM ipo_offerings WHERE code='IPO-03');

INSERT INTO ipo_offerings(code,name,symbol,price,available_quantity,remaining_quantity,status)
SELECT 'IPO-04','JSE Mobility','JSEMOBILITY',900,60000,60000,'OPEN'
WHERE NOT EXISTS (SELECT 1 FROM ipo_offerings WHERE code='IPO-04');