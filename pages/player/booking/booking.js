const api = require('../../../utils/api.js');
const promoRules = require('../../../config/promoRules.js');

// 187 种标准拼豆调色板常驻内存
const PALETTE_TABLE = [
  { code: 'A1', r: 250, g: 244, b: 200, hex: '#FAF4C8' }, { code: 'A2', r: 255, g: 255, b: 213, hex: '#FFFFD5' },
  { code: 'A3', r: 254, g: 255, b: 139, hex: '#FEFF8B' }, { code: 'A4', r: 251, g: 237, b: 86, hex: '#FBED56' },
  { code: 'A5', r: 244, g: 215, b: 56, hex: '#F4D738' }, { code: 'A6', r: 254, g: 172, b: 76, hex: '#FEAC4C' },
  { code: 'A7', r: 254, g: 139, b: 76, hex: '#FE8B4C' }, { code: 'A8', r: 255, g: 218, b: 69, hex: '#FFDA45' },
  { code: 'A9', r: 255, g: 153, b: 91, hex: '#FF995B' }, { code: 'A10', r: 247, g: 124, b: 49, hex: '#F77C31' },
  { code: 'A11', r: 255, g: 221, b: 153, hex: '#FFDD99' }, { code: 'A12', r: 254, g: 159, b: 114, hex: '#FE9F72' },
  { code: 'A13', r: 255, g: 195, b: 101, hex: '#FFC365' }, { code: 'A14', r: 253, g: 84, b: 61, hex: '#FD543D' },
  { code: 'A15', r: 255, g: 243, b: 101, hex: '#FFF365' }, { code: 'A16', r: 255, g: 255, b: 159, hex: '#FFFF9F' },
  { code: 'A17', r: 255, g: 227, b: 110, hex: '#FFE36E' }, { code: 'A18', r: 254, g: 190, b: 125, hex: '#FEBE7D' },
  { code: 'A19', r: 253, g: 124, b: 114, hex: '#FD7C72' }, { code: 'A20', r: 255, g: 213, b: 104, hex: '#FFD568' },
  { code: 'A21', r: 255, g: 227, b: 149, hex: '#FFE395' }, { code: 'A22', r: 244, g: 245, b: 125, hex: '#F4F57D' },
  { code: 'A23', r: 230, g: 201, b: 183, hex: '#E6C9B7' }, { code: 'A24', r: 247, g: 248, b: 162, hex: '#F7F8A2' },
  { code: 'A25', r: 255, g: 214, b: 125, hex: '#FFD67D' }, { code: 'A26', r: 255, g: 200, b: 48, hex: '#FFC830' },
  { code: 'B1', r: 230, g: 238, b: 49, hex: '#E6EE31' }, { code: 'B2', r: 99, g: 243, b: 71, hex: '#63F347' },
  { code: 'B3', r: 158, g: 247, b: 128, hex: '#9EF780' }, { code: 'B4', r: 93, g: 224, b: 53, hex: '#5DE035' },
  { code: 'B5', r: 53, g: 227, b: 82, hex: '#35E352' }, { code: 'B6', r: 101, g: 226, b: 166, hex: '#65E2A6' },
  { code: 'B7', r: 61, g: 175, b: 128, hex: '#3DAF80' }, { code: 'B8', r: 28, g: 156, b: 79, hex: '#1C9C4F' },
  { code: 'B9', r: 39, g: 82, b: 58, hex: '#27523A' }, { code: 'B10', r: 149, g: 211, b: 194, hex: '#95D3C2' },
  { code: 'B11', r: 93, g: 114, b: 42, hex: '#5D722A' }, { code: 'B12', r: 22, g: 111, b: 65, hex: '#166F41' },
  { code: 'B13', r: 202, g: 235, b: 123, hex: '#CAEB7B' }, { code: 'B14', r: 173, g: 233, b: 70, hex: '#ADE946' },
  { code: 'B15', r: 46, g: 81, b: 50, hex: '#2E5132' }, { code: 'B16', r: 197, g: 237, b: 156, hex: '#C5ED9C' },
  { code: 'B17', r: 155, g: 177, b: 58, hex: '#9BB13A' }, { code: 'B18', r: 230, g: 238, b: 73, hex: '#E6EE49' },
  { code: 'B19', r: 36, g: 184, b: 140, hex: '#24B88C' }, { code: 'B20', r: 194, g: 240, b: 204, hex: '#C2F0CC' },
  { code: 'B21', r: 21, g: 106, b: 107, hex: '#156A6B' }, { code: 'B22', r: 11, g: 60, b: 67, hex: '#0B3C43' },
  { code: 'B23', r: 48, g: 58, b: 33, hex: '#303A21' }, { code: 'B24', r: 238, g: 252, b: 165, hex: '#EEFCA5' },
  { code: 'B25', r: 78, g: 132, b: 109, hex: '#4E846D' }, { code: 'B26', r: 141, g: 122, b: 53, hex: '#8D7A35' },
  { code: 'B27', r: 204, g: 225, b: 175, hex: '#CCE1AF' }, { code: 'B28', r: 158, g: 229, b: 185, hex: '#9EE5B9' },
  { code: 'B29', r: 197, g: 226, b: 84, hex: '#C5E254' }, { code: 'B30', r: 226, g: 252, b: 177, hex: '#E2FCB1' },
  { code: 'B31', r: 176, g: 231, b: 146, hex: '#B0E792' }, { code: 'B32', r: 156, g: 171, b: 90, hex: '#9CAB5A' },
  { code: 'C1', r: 232, g: 255, b: 231, hex: '#E8FFE7' }, { code: 'C2', r: 169, g: 249, b: 252, hex: '#A9F9FC' },
  { code: 'C3', r: 160, g: 226, b: 251, hex: '#A0E2FB' }, { code: 'C4', r: 65, g: 204, b: 255, hex: '#41CCFF' },
  { code: 'C5', r: 1, g: 172, b: 235, hex: '#01ACEB' }, { code: 'C6', r: 80, g: 170, b: 240, hex: '#50AAF0' },
  { code: 'C7', r: 54, g: 119, b: 210, hex: '#3677D2' }, { code: 'C8', r: 15, g: 84, b: 192, hex: '#0F54C0' },
  { code: 'C9', r: 50, g: 75, b: 202, hex: '#324BCA' }, { code: 'C10', r: 62, g: 188, b: 226, hex: '#3EBCE2' },
  { code: 'C11', r: 40, g: 221, b: 222, hex: '#28DDDE' }, { code: 'C12', r: 28, g: 51, b: 77, hex: '#1C334D' },
  { code: 'C13', r: 205, g: 232, b: 255, hex: '#CDE8FF' }, { code: 'C14', r: 213, g: 253, b: 255, hex: '#D5FDFF' },
  { code: 'C15', r: 34, g: 196, b: 198, hex: '#22C4C6' }, { code: 'C16', r: 21, g: 87, b: 168, hex: '#1557A8' },
  { code: 'C17', r: 4, g: 209, b: 246, hex: '#04D1F6' }, { code: 'C18', r: 29, g: 51, b: 68, hex: '#1D3344' },
  { code: 'C19', r: 24, g: 135, b: 162, hex: '#1887A2' }, { code: 'C20', r: 23, g: 109, b: 175, hex: '#176DAF' },
  { code: 'C21', r: 190, g: 221, b: 255, hex: '#BEDDFF' }, { code: 'C22', r: 103, g: 180, b: 190, hex: '#67B4BE' },
  { code: 'C23', r: 200, g: 226, b: 255, hex: '#C8E2FF' }, { code: 'C24', r: 124, g: 196, b: 255, hex: '#7CC4FF' },
  { code: 'C25', r: 169, g: 229, b: 229, hex: '#A9E5E5' }, { code: 'C26', r: 60, g: 174, b: 216, hex: '#3CAED8' },
  { code: 'C27', r: 211, g: 223, b: 250, hex: '#D3DFFA' }, { code: 'C28', r: 187, g: 207, b: 237, hex: '#BBCFED' },
  { code: 'C29', r: 52, g: 72, b: 142, hex: '#34488E' },
  { code: 'D1', r: 174, g: 180, b: 242, hex: '#AEB4F2' }, { code: 'D2', r: 133, g: 142, b: 221, hex: '#858EDD' },
  { code: 'D3', r: 47, g: 84, b: 175, hex: '#2F54AF' }, { code: 'D4', r: 24, g: 42, b: 132, hex: '#182A84' },
  { code: 'D5', r: 184, g: 67, b: 197, hex: '#B843C5' }, { code: 'D6', r: 172, g: 123, b: 222, hex: '#AC7BDE' },
  { code: 'D7', r: 136, g: 84, b: 179, hex: '#8854B3' }, { code: 'D8', r: 226, g: 211, b: 255, hex: '#E2D3FF' },
  { code: 'D9', r: 213, g: 185, b: 248, hex: '#D5B9F8' }, { code: 'D10', r: 54, g: 24, b: 81, hex: '#361851' },
  { code: 'D11', r: 185, g: 186, b: 225, hex: '#B9BAE1' }, { code: 'D12', r: 222, g: 154, b: 212, hex: '#DE9AD4' },
  { code: 'D13', r: 185, g: 0, b: 149, hex: '#B90095' }, { code: 'D14', r: 139, g: 39, b: 155, hex: '#8B279B' },
  { code: 'D15', r: 47, g: 31, b: 144, hex: '#2F1F90' }, { code: 'D16', r: 227, g: 225, b: 238, hex: '#E3E1EE' },
  { code: 'D17', r: 196, g: 212, b: 246, hex: '#C4D4F6' }, { code: 'D18', r: 164, g: 94, b: 199, hex: '#A45EC7' },
  { code: 'D19', r: 216, g: 195, b: 215, hex: '#D8C3D7' }, { code: 'D20', r: 156, g: 50, b: 178, hex: '#9C32B2' },
  { code: 'D21', r: 154, g: 0, b: 155, hex: '#9A009B' }, { code: 'D22', r: 51, g: 58, b: 149, hex: '#333A95' },
  { code: 'D23', r: 235, g: 218, b: 252, hex: '#EBDAFC' }, { code: 'D24', r: 119, g: 134, b: 229, hex: '#7786E5' },
  { code: 'D25', r: 73, g: 79, b: 199, hex: '#494FC7' }, { code: 'D26', r: 223, g: 194, b: 248, hex: '#DFC2F8' },
  { code: 'E1', r: 253, g: 211, b: 204, hex: '#FDD3CC' }, { code: 'E2', r: 254, g: 192, b: 223, hex: '#FEC0DF' },
  { code: 'E3', r: 255, g: 183, b: 231, hex: '#FFB7E7' }, { code: 'E4', r: 232, g: 100, b: 158, hex: '#E8649E' },
  { code: 'E5', r: 245, g: 81, b: 162, hex: '#F551A2' }, { code: 'E6', r: 241, g: 61, b: 116, hex: '#F13D74' },
  { code: 'E7', r: 198, g: 52, b: 120, hex: '#C63478' }, { code: 'E8', r: 255, g: 219, b: 233, hex: '#FFDBE9' },
  { code: 'E9', r: 233, g: 112, b: 204, hex: '#E970CC' }, { code: 'E10', r: 211, g: 55, b: 147, hex: '#D33793' },
  { code: 'E11', r: 252, g: 221, b: 210, hex: '#FCDDD2' }, { code: 'E12', r: 247, g: 143, b: 195, hex: '#F78FC3' },
  { code: 'E13', r: 181, g: 0, b: 109, hex: '#B5006D' }, { code: 'E14', r: 255, g: 209, b: 186, hex: '#FFD1BA' },
  { code: 'E15', r: 248, g: 199, b: 201, hex: '#F8C7C9' }, { code: 'E16', r: 255, g: 243, b: 235, hex: '#FFF3EB' },
  { code: 'E17', r: 255, g: 226, b: 234, hex: '#FFE2EA' }, { code: 'E18', r: 255, g: 199, b: 219, hex: '#FFC7DB' },
  { code: 'E19', r: 254, g: 186, b: 213, hex: '#FEBAD5' }, { code: 'E20', r: 216, g: 199, b: 209, hex: '#D8C7D1' },
  { code: 'E21', r: 189, g: 157, b: 161, hex: '#BD9DA1' }, { code: 'E22', r: 183, g: 133, b: 161, hex: '#B785A1' },
  { code: 'E23', r: 147, g: 122, b: 141, hex: '#937A8D' }, { code: 'E24', r: 225, g: 188, b: 232, hex: '#E1BCE8' },
  { code: 'F1', r: 253, g: 149, b: 123, hex: '#FD957B' }, { code: 'F2', r: 252, g: 61, b: 70, hex: '#FC3D46' },
  { code: 'F3', r: 247, g: 73, b: 65, hex: '#F74941' }, { code: 'F4', r: 252, g: 40, b: 60, hex: '#FC283C' },
  { code: 'F5', r: 231, g: 0, b: 47, hex: '#E7002F' }, { code: 'F6', r: 148, g: 54, b: 48, hex: '#943630' },
  { code: 'F7', r: 151, g: 25, b: 55, hex: '#971937' }, { code: 'F8', r: 188, g: 0, b: 40, hex: '#BC0028' },
  { code: 'F9', r: 226, g: 103, b: 122, hex: '#E2677A' }, { code: 'F10', r: 138, g: 69, b: 38, hex: '#8A4526' },
  { code: 'F11', r: 90, g: 33, b: 33, hex: '#5A2121' }, { code: 'F12', r: 253, g: 78, b: 106, hex: '#FD4E6A' },
  { code: 'F13', r: 243, g: 87, b: 68, hex: '#F35744' }, { code: 'F14', r: 255, g: 169, b: 173, hex: '#FFA9AD' },
  { code: 'F15', r: 211, g: 0, b: 34, hex: '#D30022' }, { code: 'F16', r: 254, g: 194, b: 166, hex: '#FEC2A6' },
  { code: 'F17', r: 230, g: 156, b: 121, hex: '#E69C79' }, { code: 'F18', r: 211, g: 124, b: 70, hex: '#D37C46' },
  { code: 'F19', r: 193, g: 68, b: 74, hex: '#C1444A' }, { code: 'F20', r: 205, g: 147, b: 145, hex: '#CD9391' },
  { code: 'F21', r: 247, g: 180, b: 198, hex: '#F7B4C6' }, { code: 'F22', r: 253, g: 192, b: 208, hex: '#FDC0D0' },
  { code: 'F23', r: 246, g: 126, b: 102, hex: '#F67E66' }, { code: 'F24', r: 230, g: 152, b: 170, hex: '#E698AA' },
  { code: 'F25', r: 229, g: 75, b: 79, hex: '#E54B4F' },
  { code: 'G1', r: 255, g: 226, b: 206, hex: '#FFE2CE' }, { code: 'G2', r: 255, g: 196, b: 170, hex: '#FFC4AA' },
  { code: 'G3', r: 244, g: 195, b: 165, hex: '#F4C3A5' }, { code: 'G4', r: 225, g: 179, b: 131, hex: '#E1B383' },
  { code: 'G5', r: 237, g: 176, b: 69, hex: '#EDB045' }, { code: 'G6', r: 233, g: 156, b: 23, hex: '#E99C17' },
  { code: 'G7', r: 157, g: 91, b: 62, hex: '#9D5B3E' }, { code: 'G8', r: 117, g: 56, b: 50, hex: '#753832' },
  { code: 'G9', r: 230, g: 180, b: 131, hex: '#E6B483' }, { code: 'G10', r: 217, g: 140, b: 57, hex: '#D98C39' },
  { code: 'G11', r: 224, g: 197, b: 147, hex: '#E0C593' }, { code: 'G12', r: 255, g: 200, b: 144, hex: '#FFC890' },
  { code: 'G13', r: 183, g: 113, b: 74, hex: '#B7714A' }, { code: 'G14', r: 141, g: 97, b: 76, hex: '#8D614C' },
  { code: 'G15', r: 252, g: 249, b: 224, hex: '#FCF9E0' }, { code: 'G16', r: 242, g: 217, b: 186, hex: '#F2D9BA' },
  { code: 'G17', r: 120, g: 82, b: 75, hex: '#78524B' }, { code: 'G18', r: 255, g: 228, b: 204, hex: '#FFE4CC' },
  { code: 'G19', r: 224, g: 121, b: 53, hex: '#E07935' }, { code: 'G20', r: 169, g: 64, b: 35, hex: '#A94023' },
  { code: 'G21', r: 184, g: 133, b: 88, hex: '#B88558' },
  { code: 'H1', r: 253, g: 251, b: 255, hex: '#FDFBFF' }, { code: 'H2', r: 254, g: 255, b: 255, hex: '#FEFFFF' },
  { code: 'H3', r: 182, g: 177, b: 186, hex: '#B6B1BA' }, { code: 'H4', r: 137, g: 133, b: 140, hex: '#89858C' },
  { code: 'H5', r: 72, g: 70, b: 78, hex: '#48464E' }, { code: 'H6', r: 47, g: 43, b: 47, hex: '#2F2B2F' },
  { code: 'H7', r: 0, g: 0, b: 0, hex: '#000000' }, { code: 'H8', r: 231, g: 214, b: 219, hex: '#E7D6DB' },
  { code: 'H9', r: 237, g: 237, b: 237, hex: '#EDEDED' }, { code: 'H10', r: 238, g: 233, b: 234, hex: '#EEE9EA' },
  { code: 'H11', r: 206, g: 205, b: 213, hex: '#CECDD5' }, { code: 'H12', r: 255, g: 245, b: 237, hex: '#FFF5ED' },
  { code: 'H13', r: 245, g: 236, b: 210, hex: '#F5ECD2' }, { code: 'H14', r: 207, g: 215, b: 211, hex: '#CFD7D3' },
  { code: 'H15', r: 152, g: 166, b: 168, hex: '#98A6A8' }, { code: 'H16', r: 29, g: 20, b: 20, hex: '#1D1414' },
  { code: 'H17', r: 241, g: 237, b: 237, hex: '#F1EDED' }, { code: 'H18', r: 255, g: 253, b: 240, hex: '#FFFDF0' },
  { code: 'H19', r: 246, g: 239, b: 226, hex: '#F6EFE2' }, { code: 'H20', r: 148, g: 159, b: 163, hex: '#949FA3' },
  { code: 'H21', r: 255, g: 251, b: 225, hex: '#FFFBE1' }, { code: 'H22', r: 202, g: 202, b: 212, hex: '#CACAD4' },
  { code: 'H23', r: 154, g: 157, b: 148, hex: '#9A9D94' },
  { code: 'M1', r: 188, g: 198, b: 184, hex: '#BCC6B8' }, { code: 'M2', r: 138, g: 163, b: 134, hex: '#8AA386' },
  { code: 'M3', r: 105, g: 125, b: 128, hex: '#697D80' }, { code: 'M4', r: 227, g: 210, b: 188, hex: '#E3D2BC' },
  { code: 'M5', r: 208, g: 204, b: 170, hex: '#D0CCAA' }, { code: 'M6', r: 176, g: 167, b: 130, hex: '#B0A782' },
  { code: 'M7', r: 180, g: 164, b: 151, hex: '#B4A497' }, { code: 'M8', r: 179, g: 130, b: 129, hex: '#B38281' },
  { code: 'M9', r: 165, g: 135, b: 103, hex: '#A58767' }, { code: 'M10', r: 197, g: 178, b: 188, hex: '#C5B2BC' },
  { code: 'M11', r: 159, g: 117, b: 148, hex: '#9F7594' }, { code: 'M12', r: 100, g: 71, b: 73, hex: '#644749' },
  { code: 'M13', r: 209, g: 144, b: 102, hex: '#D19066' }, { code: 'M14', r: 199, g: 115, b: 98, hex: '#C77362' },
  { code: 'M15', r: 117, g: 125, b: 120, hex: '#757D78' }
];

// 核心感知色彩加权匹配纯函数
function matchNearestBead(r, g, b) {
  let minD = Infinity;
  let closest = PALETTE_TABLE[0];
  for (let i = 0; i < PALETTE_TABLE.length; i++) {
    const item = PALETTE_TABLE[i];
    const dr = r - item.r;
    const dg = g - item.g;
    const db = b - item.b;
    const d = 0.3 * (dr * dr) + 0.59 * (dg * dg) + 0.11 * (db * db);
    if (d < minD) {
      minD = d;
      closest = item;
    }
  }
  return closest;
}

const ALL_HALF_HOUR_SLOTS = [
  "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
  "22:00", "22:30"
];

Page({
  data: {
    colorLimitOptions: [2, 4, 6, 8, 10, 20, 30, 50, 100, 999],
    maxColorLimit: 999, // 默认不限
    usedColorList: [],  // 图中使用的色号统计
    currentTab: 0,
    activeBooking: null,

    userPhone: '',
    userDisplayName: '拼豆玩家',
    userStoredHours: 0.0,
    useStoredToggle: false,

    peopleOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    peopleIndex: 0,
    rawDurationValues: [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 12.0],
    durationDisplayOptions: ['1小时', '2小时', '3小时', '4小时', '5小时', '6小时', '当天无限量'],
    durationIndex: 1,

    packagesList: [],
    currentPackage: null,
    isPackageAvailable: true,
    packageWarningTip: '',
    isUnlimited: false,

    minDate: '',
    maxDate: '',
    selectedDate: '',
    selectedDateDesc: '',
    schedulesCloudMap: {},
    allShopBookings: [],
    timeSlotsForCurrentDay: [],
    selectedSlots: [],

    packageBaseHours: 2.0,
    maxAllowedHours: 2.0,
    currentBookedHours: 0.0,
    usedStoredHoursForThisOrder: 0.0,
    remainingDepositHours: 0.0,

    formData: { location: '店里' },

    myCoupons: [],
    availableCoupons: [],
    couponPickerOptions: ['不使用优惠券'],
    couponIndex: 0,
    rawTotalAmount: '0.0',
    discountAmount: '0.0',
    finalPayAmount: '0.0',

    userHistoryList: [],

    // 像素图纸 Canvas 2D 相关
    sizeOptions: [52, 72, 104],
    boardGridSize: 52,
    totalBeadCount: 2704,
    pickedImageSrc: '',
    filledCount: 0,

    showEditProfileModal: false,
    profileForm: {
      name: '',
      phone: '',
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }
  },

  _canvas: null,
  _ctx: null,
  _canvasSide: 0, // 强制正方形边长（px）
  _cellSize: 0,
  _gridData: [], // 扁平像素数组：{ trueColor, grayColor, isLit }
  _lastTouchedIndex: -1,
  _lastVibrateTime: 0,

  onShow() {
    this.initUserPhone();
    this.initDateRange();
    this.loadCloudPackages();
    this.loadCloudSchedulesAndBookings();
    this.loadCloudUserCoupons();
    this.refreshUserBookings();
  },

  switchTab(e) {
    const idx = Number(e.currentTarget.dataset.index);
    this.setData({ currentTab: idx });
    if (idx === 0 || idx === 2 || idx === 3) {
      this.loadCloudUserCoupons();
      this.refreshUserBookings();
      this.loadCloudPlayerDetail();
    } else if (idx === 1) {
      setTimeout(() => {
        this.initBubbleCanvas();
      }, 100);
    }
  },

  goToBookingTab() {
    this.setData({ currentTab: 0 });
  },

  // ==========================================
  // 核心：绝对正圆形 + 划过点亮 Canvas 引擎
  // ==========================================
  initBubbleCanvas() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#bubbleCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) return;
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const winInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
        const dpr = winInfo.pixelRatio || 2;

        // 核心：强制宽高等值取最小值，彻底杜绝椭圆变形
        const side = Math.min(res[0].width, res[0].height);
        canvas.width = side * dpr;
        canvas.height = side * dpr;
        ctx.scale(dpr, dpr);

        this._canvas = canvas;
        this._ctx = ctx;
        this._canvasSide = side;

        this.resetGridData();
        this.renderFullCanvas();
      });
  },

  onSizeChange(e) {
    const size = Number(e.currentTarget.dataset.size);
    if (size === this.data.boardGridSize) return;
    this.setData({ 
      boardGridSize: size, 
      totalBeadCount: size * size,
      filledCount: 0 
    });
    this.resetGridData();
    if (this.data.pickedImageSrc) {
      this.generatePixelBlueprint();
    } else {
      this.renderFullCanvas();
    }
  },

  onColorLimitChange(e) {
    const val = Number(e.currentTarget.dataset.val);
    this.setData({ maxColorLimit: val });
    if (this.data.pickedImageSrc) {
      this.generatePixelBlueprint();
    }
  },

  resetGridData() {
    const n = this.data.boardGridSize;
    this._cellSize = this._canvasSide / n;
    const total = n * n;
    this._gridData = new Array(total);

    for (let i = 0; i < total; i++) {
      this._gridData[i] = {
        trueColor: '#4A90E2', // 默认测试色
        grayColor: '#E2E8F0', // 置灰默认底孔
        isLit: false          // 是否已点亮
      };
    }
    this._lastTouchedIndex = -1;
  },

  chooseUserImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath;
        this.setData({ pickedImageSrc: tempPath });
        wx.showToast({ title: '已选取，请点生成', icon: 'success' });
      }
    });
  },

  // 离屏下采样并根据【最大颜色数量化】算法提取图纸
  generatePixelBlueprint() {
    if (!this.data.pickedImageSrc) return;
    wx.showLoading({ title: '色彩量化匹配中...' });

    const n = this.data.boardGridSize;
    const query = wx.createSelectorQuery().in(this);
    query.select('#offscreenCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) {
          wx.hideLoading();
          return;
        }
        const offCanvas = res[0].node;
        const offCtx = offCanvas.getContext('2d');
        offCanvas.width = n;
        offCanvas.height = n;

        const img = offCanvas.createImage();
        img.onload = () => {
          offCtx.drawImage(img, 0, 0, n, n);
          const imgData = offCtx.getImageData(0, 0, n, n).data;

          const total = n * n;
          const tempMatchedBeads = new Array(total);
          const colorCountMap = {};

          // 第一阶段：将全图每个像素映射为最接近的标准拼豆色并统计频次
          for (let i = 0; i < total; i++) {
            const idx = i * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a = imgData[idx + 3];

            if (a < 15) {
              tempMatchedBeads[i] = null; // 空白
            } else {
              const matched = matchNearestBead(r, g, b);
              tempMatchedBeads[i] = matched;
              colorCountMap[matched.code] = (colorCountMap[matched.code] || 0) + 1;
            }
          }

          // 第二阶段：主色量化筛选 (Palette Clamping)
          const limit = this.data.maxColorLimit;
          let allowedPalette = [];

          // 排序统计高频主色
          const sortedBeadCodes = Object.keys(colorCountMap).sort((a, b) => colorCountMap[b] - colorCountMap[a]);
          const finalBeadCodes = sortedBeadCodes.slice(0, limit);
          allowedPalette = PALETTE_TABLE.filter(item => finalBeadCodes.includes(item.code));

          // 第三阶段：未入选的颜色强制坍缩合并到允许的候选色中
          const finalColorCount = {};

          for (let i = 0; i < total; i++) {
            const bead = tempMatchedBeads[i];
            if (!bead) {
              this._gridData[i] = {
                trueColor: '#FFFFFF',
                grayColor: '#F8FAFC',
                isLit: false,
                code: ''
              };
              continue;
            }

            let finalBead = bead;
            // 如果超出了限定颜色范围，从允许的调色板中选出最接近的替换
            if (!finalBeadCodes.includes(bead.code) && allowedPalette.length > 0) {
              let minD = Infinity;
              for (let p = 0; p < allowedPalette.length; p++) {
                const target = allowedPalette[p];
                const dr = bead.r - target.r;
                const dg = bead.g - target.g;
                const db = bead.b - target.b;
                const d = 0.3 * (dr * dr) + 0.59 * (dg * dg) + 0.11 * (db * db);
                if (d < minD) {
                  minD = d;
                  finalBead = target;
                }
              }
            }

            finalColorCount[finalBead.code] = (finalColorCount[finalBead.code] || 0) + 1;

            // 计算置灰轮廓色
            const grayVal = Math.round(0.299 * finalBead.r + 0.587 * finalBead.g + 0.114 * finalBead.b);
            const blendedGray = Math.round(grayVal * 0.35 + 215 * 0.65);
            const grayCol = `rgb(${blendedGray},${blendedGray},${blendedGray})`;

            this._gridData[i] = {
              trueColor: finalBead.hex,
              grayColor: grayCol,
              isLit: false,
              code: finalBead.code
            };
          }

          // 整理当前图纸使用的色号列表（用于顶部展示）
          const usedList = Object.keys(finalColorCount).map(code => {
            const item = PALETTE_TABLE.find(c => c.code === code);
            return {
              code: code,
              hex: item ? item.hex : '#000000',
              count: finalColorCount[code]
            };
          }).sort((a, b) => b.count - a.count);

          this.setData({ 
            filledCount: 0,
            usedColorList: usedList 
          });

          this.renderFullCanvas();
          wx.hideLoading();
          wx.showToast({ title: `已限定为 ${usedList.length} 色`, icon: 'success' });
        };
        img.onerror = () => {
          wx.hideLoading();
          wx.showToast({ title: '图片读取失败', icon: 'none' });
        };
        img.src = this.data.pickedImageSrc;
      });
  },

  // 全量重绘
  renderFullCanvas() {
    if (!this._ctx) return;
    const ctx = this._ctx;
    const n = this.data.boardGridSize;
    const cell = this._cellSize;
    const radius = Math.max(0.8, (cell / 2) - 0.4);

    ctx.clearRect(0, 0, this._canvasSide, this._canvasSide);

    // 绘制底板微阴影背景
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(0, 0, this._canvasSide, this._canvasSide);

    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const i = r * n + c;
        const cx = c * cell + cell / 2;
        const cy = r * cell + cell / 2;
        this.drawSingleBead(ctx, cx, cy, radius, this._gridData[i]);
      }
    }
  },

  // 严格正圆绘制：未点亮为微凹置灰孔，点亮后为原图真彩凸起圆豆
  drawSingleBead(ctx, cx, cy, radius, item) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);

    if (item.isLit) {
      // 1. 已点亮：真彩色实心饱满圆豆
      ctx.fillStyle = item.trueColor;
      ctx.fill();
      // 微光高光圈
      ctx.lineWidth = Math.max(0.5, radius * 0.2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.stroke();
    } else {
      // 2. 未点亮：低饱和度置灰凹槽，等待玩家划过激活
      ctx.fillStyle = item.grayColor;
      ctx.fill();
      // 凹陷内阴影微边
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.stroke();
    }
    ctx.restore();
  },

  // 触摸手势拦截
  onCanvasTouchStart(e) {
    this.handleLightUpBead(e);
  },

  onCanvasTouchMove(e) {
    this.handleLightUpBead(e);
  },

  onCanvasTouchEnd() {
    this._lastTouchedIndex = -1;
  },

  // 划过即点亮（解压捏泡泡核心）
  // 粗画笔多点并发点亮 + 强感震动
  handleLightUpBead(e) {
    if (!this._ctx || !e.touches || e.touches.length === 0) return;
    const touch = e.touches[0];
    const n = this.data.boardGridSize;
    const cell = this._cellSize;

    const query = wx.createSelectorQuery().in(this);
    query.select('#bubbleCanvas').boundingClientRect((rect) => {
      if (!rect) return;
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;

      if (x < 0 || y < 0 || x >= rect.width || y >= rect.height) return;

      const centerC = Math.floor(x / cell);
      const centerR = Math.floor(y / cell);
      if (centerR < 0 || centerR >= n || centerC < 0 || centerC >= n) return;

      const centerIdx = centerR * n + centerC;
      if (centerIdx === this._lastTouchedIndex) return;
      this._lastTouchedIndex = centerIdx;

      // 动态画笔粗细：根据网格规格自适应辐射半径 (r=1 为 3x3，r=2 为 5x5)
      const brushRadius = n >= 72 ? 2 : 1;
      let litCountInThisBatch = 0;
      const radius = Math.max(0.8, (cell / 2) - 0.4);

      // 圆形区域笔刷扩散
      for (let dr = -brushRadius; dr <= brushRadius; dr++) {
        for (let dc = -brushRadius; dc <= brushRadius; dc++) {
          // 保证画笔触头为圆头，非生硬方形
          if (dr * dr + dc * dc > brushRadius * brushRadius + 0.5) continue;

          const r = centerR + dr;
          const c = centerC + dc;

          if (r >= 0 && r < n && c >= 0 && c < n) {
            const idx = r * n + c;
            const item = this._gridData[idx];

            if (item && !item.isLit) {
              item.isLit = true;
              litCountInThisBatch++;

              // 局部重绘
              const cx = c * cell + cell / 2;
              const cy = r * cell + cell / 2;
              this.drawSingleBead(this._ctx, cx, cy, radius, item);
            }
          }
        }
      }

      // 如果有新豆子被点亮，触发沉稳明显的短震动
      if (litCountInThisBatch > 0) {
        const now = Date.now();
        if (now - this._lastVibrateTime > 25) {
          this._lastVibrateTime = now;
          // 改用 medium 增强物理打击反馈
          wx.vibrateShort({ type: 'medium' });
        }
        this.setData({ filledCount: this.data.filledCount + litCountInThisBatch });
      }
    }).exec();
  },

  resetBoardState() {
    this.resetGridData();
    this.setData({ filledCount: 0, pickedImageSrc: '', usedColorList: [] });
    this.renderFullCanvas();
    wx.showToast({ title: '图纸已清空', icon: 'none' });
  },
  // ==========================================
  // 基础业务（预约、卡券、个人中心）
  // ==========================================
  initUserPhone() {
    const saved = wx.getStorageSync('player_profile') || {};
    const curPhone = saved.phone || '17860380815';
    const nickname = saved.name || (curPhone ? `玩家_${curPhone.slice(-4)}` : '拼豆玩家');
    this.setData({ userPhone: curPhone, userDisplayName: nickname }, () => {
      this.loadCloudPlayerDetail();
    });
  },

  loadCloudPlayerDetail() {
    const phone = this.data.userPhone;
    if (!phone) return;
    api.getPlayerDetail(phone).then(res => {
      if (res && res.player) {
        const stored = Number(res.player.stored_hours || 0);
        this.setData({ userStoredHours: stored }, () => {
          this.recalcMaxAllowedHours();
        });
      }
    }).catch(() => {});
  },

  onPhoneInput(e) {
    const p = e.detail.value.trim();
    const nickname = p.length >= 4 ? `玩家_${p.slice(-4)}` : '拼豆玩家';
    this.setData({ userPhone: p, userDisplayName: nickname }, () => {
      this.loadCloudPlayerDetail();
    });
    wx.setStorageSync('player_profile', { phone: p, name: nickname });
  },

  initDateRange() {
    const now = new Date();
    const min = this.formatDate(now);
    const maxDateObj = new Date(now.getTime() + 14 * 24 * 3600 * 1000);
    const max = this.formatDate(maxDateObj);
    this.setData({ minDate: min, maxDate: max, selectedDate: min }, () => {
      this.resolveDaySchedule();
    });
  },

  formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  onDateChange(e) {
    this.setData({ selectedDate: e.detail.value, selectedSlots: [] }, () => {
      this.resolveDaySchedule();
    });
  },

  loadCloudPackages() {
    api.getPackages().then(res => {
      const valid = (res || []).filter(p => !p.is_off_shelf);
      this.setData({ packagesList: valid }, () => {
        this.updateDurationDisplayList();
        this.matchPackageByPeopleAndDuration();
      });
    }).catch(() => {
      this.updateDurationDisplayList();
      this.matchPackageByPeopleAndDuration();
    });
  },

  onPeopleChange(e) {
    const pIdx = Number(e.detail.value);
    const people = this.data.peopleOptions[pIdx];

    let loc = this.data.formData.location;
    if (people > 8 && loc === '店里') {
      wx.showModal({
        title: '席位提示',
        content: `店内固定仅有 8 个席位，当前选择 ${people} 人，已为您自动切换为【宿舍外带】。`,
        showCancel: false
      });
      loc = '自己宿舍';
    }

    this.setData({ 
      peopleIndex: pIdx,
      'formData.location': loc
    }, () => {
      this.updateDurationDisplayList();
      this.matchPackageByPeopleAndDuration();
      this.resolveDaySchedule();
    });
  },

  onDurationChange(e) {
    const durIdx = Number(e.detail.value);
    this.setData({ durationIndex: durIdx }, () => {
      this.matchPackageByPeopleAndDuration();
      this.recalcMaxAllowedHours();
      if (this.data.selectedSlots.length > 0 && !this.data.isUnlimited) {
        this.applyConsecutiveSlots(this.data.selectedSlots[0]);
      }
    });
  },

  updateDurationDisplayList() {
    const people = this.data.peopleOptions[this.data.peopleIndex];
    const pkgs = this.data.packagesList;
    const rawHours = this.data.rawDurationValues;

    const supportedHours = pkgs
      .filter(p => Number(p.people_limit) === people)
      .map(p => Number(p.duration_hours));

    const newDisplay = rawHours.map(h => {
      const isUnlim = (h >= 12.0);
      const label = isUnlim ? '当天无限量' : `${h}小时`;
      const exists = supportedHours.some(sh => Math.abs(sh - h) < 0.1 || (isUnlim && (sh >= 8.0 || sh === 0)));
      return exists ? label : `${label} (暂无套餐)`;
    });

    this.setData({ durationDisplayOptions: newDisplay });
  },

  matchPackageByPeopleAndDuration() {
    const people = this.data.peopleOptions[this.data.peopleIndex];
    const duration = this.data.rawDurationValues[this.data.durationIndex];
    const wantUnlimited = (duration >= 12.0);
    const pkgs = this.data.packagesList;

    let matched = pkgs.find(p => {
      const matchPeople = (Number(p.people_limit) === people);
      if (!matchPeople) return false;
      if (wantUnlimited) {
        return Number(p.duration_hours) >= 8.0 || 
               p.name.toLowerCase().includes('all') || 
               p.name.includes('无限') || 
               p.name.includes('畅玩') || 
               p.name.includes('全天');
      }
      return Math.abs(Number(p.duration_hours) - duration) < 0.1;
    });

    if (matched) {
      const isUnlim = wantUnlimited || 
                      Number(matched.duration_hours) >= 8.0 || 
                      matched.name.toLowerCase().includes('all') || 
                      matched.name.includes('无限') || 
                      matched.name.includes('全天');
      const baseH = isUnlim ? 12.0 : Number(matched.duration_hours || duration);

      this.setData({
        currentPackage: matched,
        isPackageAvailable: true,
        isUnlimited: isUnlim,
        packageWarningTip: '',
        packageBaseHours: baseH,
        selectedSlots: isUnlim ? [] : this.data.selectedSlots
      }, () => {
        this.recalcMaxAllowedHours();
        this.calculateFinalPrice();
      });
    } else {
      const samePeople = pkgs.filter(p => Number(p.people_limit) === people);
      let guideMsg = '';
      if (samePeople.length > 0) {
        const availList = samePeople.map(p => (p.duration_hours >= 8.0 || p.name.includes('无限')) ? '当天无限量' : `${p.duration_hours}h`).join('、');
        guideMsg = `该人数当前仅有 ${availList} 套餐可选，请切换上方时长`;
      } else {
        guideMsg = `店内暂无 ${people} 人专属套餐，请调整人数或联系店长`;
      }

      this.setData({
        currentPackage: null,
        isPackageAvailable: false,
        isUnlimited: false,
        packageWarningTip: guideMsg,
        packageBaseHours: duration,
        rawTotalAmount: '0.0',
        discountAmount: '0.0',
        finalPayAmount: '0.0'
      }, () => {
        this.recalcMaxAllowedHours();
      });
    }
  },

  toggleUseStoredHours(e) {
    const use = e.detail.value;
    if (use && this.data.userStoredHours <= 0) {
      this.setData({ useStoredToggle: false });
      return wx.showToast({ title: '账户暂无预存时长', icon: 'none' });
    }
    this.setData({ useStoredToggle: use }, () => {
      this.recalcMaxAllowedHours();
      if (this.data.selectedSlots.length > 0 && !this.data.isUnlimited) {
        this.applyConsecutiveSlots(this.data.selectedSlots[0]);
      }
    });
  },

  recalcMaxAllowedHours() {
    if (this.data.isUnlimited) {
      this.setData({ maxAllowedHours: 12.0 }, () => {
        this.calculateHourDeductions();
      });
      return;
    }
    const base = Number(this.data.packageBaseHours || 2.0);
    const extra = this.data.useStoredToggle ? Number(this.data.userStoredHours || 0) : 0;
    const maxH = Number((base + extra).toFixed(1));
    this.setData({ maxAllowedHours: maxH }, () => {
      this.calculateHourDeductions();
    });
  },

  loadCloudSchedulesAndBookings() {
    api.getBookings().then(bookings => {
      this.setData({ allShopBookings: bookings || [] });
      return api.getSchedules();
    }).then(res => {
      const map = {};
      (res || []).forEach(row => {
        try {
          map[row.schedule_type] = typeof row.slots === 'string' ? JSON.parse(row.slots) : row.slots;
        } catch (e) {
          map[row.schedule_type] = [];
        }
      });
      this.setData({ schedulesCloudMap: map }, () => {
        this.resolveDaySchedule();
      });
    }).catch(err => {
      console.error('排班加载异常', err);
    });
  },

  resolveDaySchedule() {
    const dateStr = this.data.selectedDate;
    if (!dateStr) return;

    const dateObj = new Date(dateStr.replace(/-/g, '/'));
    const dayOfWeek = dateObj.getDay();

    let scheduleKey = 'mon_thu';
    let desc = '周一至周四时段';
    if (dayOfWeek === 5) {
      scheduleKey = 'fri';
      desc = '周五时段';
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      scheduleKey = 'weekend';
      desc = (dayOfWeek === 6 ? '周六' : '周日') + ' (周末时段)';
    }

    const openSlots = this.data.schedulesCloudMap[scheduleKey] || [];
    const allBookings = this.data.allShopBookings || [];
    const selectedList = this.data.selectedSlots;
    const currentPeople = this.data.peopleOptions[this.data.peopleIndex];

    const now = new Date();
    const todayStr = this.formatDate(now);
    const isToday = (dateStr === todayStr);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const slotItems = ALL_HALF_HOUR_SLOTS.map(t => {
      const timeParts = t.split(':');
      const sh = Number(timeParts[0]);
      const sm = Number(timeParts[1]);
      const slotMinutes = sh * 60 + sm;
      const isPast = isToday && (slotMinutes <= nowMinutes);

      const occupiedSeats = allBookings
        .filter(b => b.location === '店里' && (b.status === '待核销' || b.status === '体验中') && this.isTimeOverlap(b.booking_time, dateStr, t))
        .reduce((sum, b) => sum + (Number(b.people_count || b.peopleCount) || 1), 0);

      const remainSeats = Math.max(0, 8 - occupiedSeats);
      const remainTools = Math.max(0, 12 - occupiedSeats);
      const isFull = (remainSeats < currentPeople);
      const isOpen = !isPast && openSlots.includes(t) && !isFull;
      const isSelected = selectedList.includes(t);

      return {
        time: t,
        isOpen: isOpen,
        isFull: isFull,
        isPast: isPast,
        isSelected: isSelected,
        remainingSeats: remainSeats,
        remainingTools: remainTools
      };
    });

    this.setData({
      selectedDateDesc: desc,
      timeSlotsForCurrentDay: slotItems
    });

    if (selectedList.length === 0 && !this.data.isUnlimited) {
      const firstOpen = slotItems.find(i => i.isOpen);
      if (firstOpen) {
        this.applyConsecutiveSlots(firstOpen.time);
      }
    }
  },

  isTimeOverlap(bookingTimeStr, curDate, curSlot) {
    if (!bookingTimeStr || !bookingTimeStr.startsWith(curDate)) return false;
    return bookingTimeStr.includes(curSlot);
  },

  selectTimeSlot(e) {
    if (this.data.isUnlimited) return;
    const slot = e.currentTarget.dataset.slot;
    if (slot.isPast) return wx.showToast({ title: '该时间段已过去，无法预约', icon: 'none' });
    if (!slot.isOpen) return wx.showToast({ title: slot.isFull ? '席位不足当前人数' : '本店此时段未营业', icon: 'none' });

    const maxSlots = Math.round(this.data.maxAllowedHours * 2);
    let curSelected = [...this.data.selectedSlots];
    const exists = curSelected.includes(slot.time);

    if (exists) {
      curSelected = curSelected.filter(t => t !== slot.time);
    } else {
      if (curSelected.length >= maxSlots) {
        wx.showToast({ title: `已达上限 ${this.data.maxAllowedHours}h，重选起点`, icon: 'none' });
        this.applyConsecutiveSlots(slot.time);
        return;
      }
      curSelected.push(slot.time);
      curSelected.sort();
    }

    this.setData({ selectedSlots: curSelected }, () => {
      this.calculateHourDeductions();
      this.refreshSlotSelectionState();
    });
  },

  applyConsecutiveSlots(startTime) {
    if (this.data.isUnlimited) return;
    const duration = this.data.maxAllowedHours;
    const needSlotsCount = Math.round(duration * 2);
    const startIdx = ALL_HALF_HOUR_SLOTS.indexOf(startTime);
    if (startIdx === -1) return;

    const people = this.data.peopleOptions[this.data.peopleIndex];
    const slotsMap = this.data.timeSlotsForCurrentDay;
    const consecutive = [];

    for (let i = 0; i < needSlotsCount; i++) {
      const targetIdx = startIdx + i;
      if (targetIdx >= ALL_HALF_HOUR_SLOTS.length) break;
      const targetTime = ALL_HALF_HOUR_SLOTS[targetIdx];
      const slotObj = slotsMap.find(s => s.time === targetTime);
      if (!slotObj || !slotObj.isOpen || slotObj.remainingSeats < people) break;
      consecutive.push(targetTime);
    }

    this.setData({ selectedSlots: consecutive }, () => {
      this.calculateHourDeductions();
      this.refreshSlotSelectionState();
    });
  },

  refreshSlotSelectionState() {
    const sel = this.data.selectedSlots;
    const updated = this.data.timeSlotsForCurrentDay.map(item => ({
      ...item,
      isSelected: sel.includes(item.time)
    }));
    this.setData({ timeSlotsForCurrentDay: updated });
  },

  calculateHourDeductions() {
    if (this.data.isUnlimited) {
      this.setData({
        currentBookedHours: 12.0,
        usedStoredHoursForThisOrder: 0.0,
        remainingDepositHours: 0.0
      });
      return;
    }

    const booked = Number((this.data.selectedSlots.length * 0.5).toFixed(1));
    const base = Number(this.data.packageBaseHours || 2.0);
    let usedStored = 0.0;
    let newDeposit = 0.0;

    if (this.data.useStoredToggle) {
      if (booked > base) {
        usedStored = Number((booked - base).toFixed(1));
      } else {
        newDeposit = Number((base - booked).toFixed(1));
      }
    } else {
      if (booked < base) {
        newDeposit = Number((base - booked).toFixed(1));
      }
    }

    this.setData({
      currentBookedHours: booked,
      usedStoredHoursForThisOrder: usedStored,
      remainingDepositHours: newDeposit
    });
  },

  changeLocation(e) {
    const val = e.currentTarget.dataset.val;
    const people = this.data.peopleOptions[this.data.peopleIndex];
    if (val === '店里' && people > 8) {
      return wx.showToast({ title: '店内最多容纳8人，已锁定外带', icon: 'none' });
    }
    this.setData({ 'formData.location': val }, () => {
      this.resolveDaySchedule();
    });
  },

  loadCloudUserCoupons() {
    const phone = this.data.userPhone;
    if (!phone) return;
    api.getUserCoupons(phone).then(list => {
      const validList = [];
      const renderMyList = (list || []).map(c => {
        const isExpired = promoRules.isCouponExpired(c.expire_at);
        let expireDesc = '长期有效';
        if (c.expire_at) {
          const expDate = new Date(c.expire_at);
          expireDesc = `${expDate.getMonth() + 1}月${expDate.getDate()}日到期`;
        }
        return { ...c, is_expired: isExpired, expire_desc: expireDesc };
      });

      renderMyList.forEach(c => {
        if (!c.is_used && !c.is_expired) validList.push(c);
      });

      const pickerOptions = ['不使用优惠券', ...validList.map(c => `${c.title} (${c.discount_val}折)`)];
      this.setData({
        myCoupons: renderMyList,
        availableCoupons: validList,
        couponPickerOptions: pickerOptions,
        couponIndex: validList.length > 0 ? 1 : 0
      }, () => {
        this.calculateFinalPrice();
      });
    }).catch(() => {});
  },

  onCouponChange(e) {
    this.setData({ couponIndex: Number(e.detail.value) }, () => {
      this.calculateFinalPrice();
    });
  },

  calculateFinalPrice() {
    if (!this.data.isPackageAvailable || !this.data.currentPackage) {
      this.setData({ rawTotalAmount: '0.0', discountAmount: '0.0', finalPayAmount: '0.0' });
      return;
    }
    const pkg = this.data.currentPackage;
    const rawTotal = Number(parseFloat(pkg.price).toFixed(1));
    let discount = 0;
    const cIdx = this.data.couponIndex;

    if (cIdx > 0 && this.data.availableCoupons[cIdx - 1]) {
      const coupon = this.data.availableCoupons[cIdx - 1];
      const rate = (coupon.discount_val || 85) / 100;
      discount = Number((rawTotal * (1 - rate)).toFixed(1));
    }

    const finalPay = Math.max(0.1, Number((rawTotal - discount).toFixed(1)));
    this.setData({
      rawTotalAmount: rawTotal.toFixed(1),
      discountAmount: Math.min(rawTotal, discount).toFixed(1),
      finalPayAmount: finalPay.toFixed(1)
    });
  },

  handleWechatPayAndBook() {
    if (!this.data.isPackageAvailable) {
      return wx.showToast({ title: '暂无对应在售套餐，请先调整规格', icon: 'none' });
    }
    const phone = this.data.userPhone;
    if (!phone || phone.length !== 11) return wx.showToast({ title: '请填写11位手机号', icon: 'none' });
    if (!this.data.isUnlimited && this.data.selectedSlots.length === 0) return wx.showToast({ title: '请至少选择一个时段', icon: 'none' });

    const peopleCount = this.data.peopleOptions[this.data.peopleIndex];
    const todayStr = this.formatDate(new Date());
    const bookingTimeStr = this.data.isUnlimited 
      ? `${todayStr} 全天无限量通票(核销起25小时有效)` 
      : `${this.data.selectedDate} [${this.data.selectedSlots.join(',')}]`;
    
    const slotsPayload = this.data.isUnlimited ? ['全天畅玩'] : this.data.selectedSlots;
    const selectedCoupon = (this.data.couponIndex > 0) ? this.data.availableCoupons[this.data.couponIndex - 1] : null;

    wx.showLoading({ title: '预约确认中...' });
    const postData = {
      user_phone: phone,
      user_name: this.data.userDisplayName,
      location: this.data.formData.location,
      package_name: this.data.currentPackage.name,
      people_count: peopleCount,
      booking_time: bookingTimeStr,
      slots_array: slotsPayload,
      used_stored_hours: this.data.isUnlimited ? 0 : this.data.usedStoredHoursForThisOrder,
      deposit_hours: this.data.isUnlimited ? 0 : this.data.remainingDepositHours,
      amount: parseFloat(this.data.finalPayAmount),
      coupon_id: selectedCoupon ? selectedCoupon.id : null
    };

    api.createBooking(postData).then(res => {
      wx.hideLoading();
      this.refreshUserBookings();
      this.loadCloudUserCoupons();
      this.loadCloudSchedulesAndBookings();
      this.loadCloudPlayerDetail();

      let modalContent = `核销码：【${res.code}】`;
      if (this.data.isUnlimited) {
        modalContent += `\n\n🌟 当天无限量通票：到店核销后立即激活，25小时内畅玩！(不产生预存时间)`;
      } else {
        modalContent += `\n预约时段：${this.data.selectedSlots.join(', ')} (共 ${this.data.currentBookedHours}h)`;
        if (this.data.usedStoredHoursForThisOrder > 0) modalContent += `\n\n⚡ 已消耗抵扣 ${this.data.usedStoredHoursForThisOrder} 小时预存时长！`;
        if (this.data.remainingDepositHours > 0) modalContent += `\n\n✨ 套餐剩余 ${this.data.remainingDepositHours} 小时已存入账户！`;
      }

      wx.showModal({ title: '预约成功！', content: modalContent, showCancel: false, confirmText: '我知道了' });
    }).catch(err => {
      wx.hideLoading();
      wx.showModal({ title: '预约未成功', content: (err && err.message) || '系统繁忙，请重试', showCancel: false });
    });
  },

  selectOrderToUse(e) {
    const order = e.currentTarget.dataset.order;
    if (!order) return;
    if (order.status !== '待核销') return wx.showToast({ title: `该订单状态为【${order.status}】`, icon: 'none' });

    this.setData({ activeBooking: order, currentTab: 0 });
    wx.showToast({ title: `已选中核销码【${order.code}】`, icon: 'success' });
  },

  refreshUserBookings() {
    const phone = this.data.userPhone;
    if (!phone) return;
    api.getBookings('', phone).then(list => {
      const all = list || [];
      const curActive = this.data.activeBooking;
      let active = null;
      if (curActive) active = all.find(i => i.code === curActive.code && (i.status === '待核销' || i.status === '体验中'));
      if (!active) active = all.find(i => i.status === '待核销' || i.status === '体验中');
      this.setData({ activeBooking: active || null, userHistoryList: all });
    }).catch(() => {});
  },

  handlePlayerApplyRefund() {
    const active = this.data.activeBooking;
    if (!active) return;
    wx.showModal({
      title: '确认申请退款',
      content: `预约码【${active.code}】尚未核销，是否立即取消预约？\n(现金与消耗的时长将同步原路归还)`,
      confirmColor: '#dc2626',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '退款申请中...' });
          api.refundBooking(active.id, active.amount, this.data.userPhone).then(() => {
            wx.hideLoading();
            wx.showToast({ title: '退款及预存时长已归还', icon: 'success' });
            this.refreshUserBookings();
            this.loadCloudSchedulesAndBookings();
            this.loadCloudPlayerDetail();
          }).catch(err => {
            wx.hideLoading();
            wx.showToast({ title: (err && err.message) || '退款失败', icon: 'none' });
          });
        }
      }
    });
  },

  openEditProfileModal() {
    this.setData({
      showEditProfileModal: true,
      profileForm: {
        name: this.data.userDisplayName,
        phone: this.data.userPhone,
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }
    });
  },

  closeEditProfileModal() { this.setData({ showEditProfileModal: false }); },
  stopBubble() {},
  onProfileNameInput(e) { this.setData({ 'profileForm.name': e.detail.value.trim() }); },
  onProfilePhoneInput(e) { this.setData({ 'profileForm.phone': e.detail.value.trim() }); },
  onProfileOldPwdInput(e) { this.setData({ 'profileForm.oldPassword': e.detail.value.trim() }); },
  onProfileNewPwdInput(e) { this.setData({ 'profileForm.newPassword': e.detail.value.trim() }); },
  onProfileConfirmPwdInput(e) { this.setData({ 'profileForm.confirmNewPassword': e.detail.value.trim() }); },

  confirmUpdateProfile() {
    const { name, phone, oldPassword, newPassword, confirmNewPassword } = this.data.profileForm;
    if (!name) return wx.showToast({ title: '昵称不能为空', icon: 'none' });
    if (!phone || phone.length !== 11) return wx.showToast({ title: '请输入有效的11位手机号', icon: 'none' });
    if (!oldPassword) return wx.showToast({ title: '必须输入原密码验证身份', icon: 'none' });

    if (newPassword) {
      if (newPassword.length < 4) return wx.showToast({ title: '新密码不能少于4位', icon: 'none' });
      if (newPassword !== confirmNewPassword) return wx.showToast({ title: '两次输入的新密码不一致', icon: 'none' });
    }

    wx.showLoading({ title: '正在保存...' });
    api.updatePlayerProfile({
      current_phone: this.data.userPhone,
      old_password: oldPassword,
      new_name: name,
      new_phone: phone,
      new_password: newPassword
    }).then(res => {
      wx.hideLoading();
      wx.showToast({ title: '资料修改成功', icon: 'success' });
      const newPhone = (res && res.phone) || phone;
      const newDisplayName = (res && res.name) || name;
      wx.setStorageSync('player_profile', { phone: newPhone, name: newDisplayName });
      this.setData({
        userPhone: newPhone,
        userDisplayName: newDisplayName,
        showEditProfileModal: false
      });
      this.loadCloudPlayerDetail();
      this.refreshUserBookings();
    }).catch(err => {
      wx.hideLoading();
      wx.showToast({ title: (err && err.message) || '修改失败', icon: 'none' });
    });
  }
});