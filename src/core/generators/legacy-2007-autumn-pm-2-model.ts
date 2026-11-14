export const sqlCases = [
  { center: 'A01', branch: 'S11', otherCenter: 'A02', offices: ['S11', 'S12', 'S13', 'S21', 'S22'], managed: true, local: true, parcel: '0000004', latest: true },
  { center: 'A02', branch: 'S21', otherCenter: 'A01', offices: ['S11', 'S12', 'S13', 'S21', 'S22'], managed: false, local: false, parcel: '0000017', latest: false },
  { center: 'A03', branch: 'S34', otherCenter: 'A04', offices: ['S31', 'S32', 'S34', 'S41', 'S42'], managed: true, local: false, parcel: '0000023', latest: true },
  { center: 'A06', branch: 'S62', otherCenter: 'A05', offices: ['S51', 'S52', 'S53', 'S61', 'S62'], managed: false, local: true, parcel: '0000042', latest: false },
] as const;
export const deliverySchemas = [
  { name: '配達地域表', fields: ['管轄地区', '支店コード'], keys: 1 },
  { name: '支店表', fields: ['支店コード', '集配センタコード'], keys: 1 },
  { name: '配達品表', fields: ['預り番号', '受付日時', '受付支店コード', '依頼元管轄地区', '依頼元住所', '依頼元氏名',
    '届け先管轄地区', '届け先住所', '届け先氏名'], keys: 1 },
  { name: '移送履歴表', fields: ['預り番号', '通過日時', '通過店コード', '入出区分'], keys: 2 },
] as const;
