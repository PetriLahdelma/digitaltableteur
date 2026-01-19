"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import styles from "./LogoConstruction.module.css";

// SVG path data for the KnobSmith Audio logo construction animation
const svgPaths = {
  // Stage 0: Three ellipses (logo mark outline)
  ellipse1:
    "M350.5 200.5C371.292 200.5 390.091 204.464 403.674 210.851C417.296 217.256 425.5 226.005 425.5 235.5C425.5 244.995 417.296 253.744 403.674 260.149C390.091 266.536 371.292 270.5 350.5 270.5C329.708 270.5 310.909 266.536 297.326 260.149C283.704 253.744 275.5 244.995 275.5 235.5C275.5 226.005 283.704 217.256 297.326 210.851C310.909 204.464 329.708 200.5 350.5 200.5Z",
  ellipse2:
    "M350.5 238.5C384.816 238.5 415.859 245.708 438.305 257.336C460.775 268.977 474.5 284.971 474.5 302.5C474.5 320.029 460.775 336.023 438.305 347.664C415.859 359.292 384.816 366.5 350.5 366.5C316.184 366.5 285.141 359.292 262.695 347.664C240.225 336.023 226.5 320.029 226.5 302.5C226.5 284.971 240.225 268.977 262.695 257.336C285.141 245.708 316.184 238.5 350.5 238.5Z",
  ellipse3:
    "M350.5 293.5C384.816 293.5 415.859 300.708 438.305 312.336C460.775 323.977 474.5 339.971 474.5 357.5C474.5 375.029 460.775 391.023 438.305 402.664C415.859 414.292 384.816 421.5 350.5 421.5C316.184 421.5 285.141 414.292 262.695 402.664C240.225 391.023 226.5 375.029 226.5 357.5C226.5 339.971 240.225 323.977 262.695 312.336C285.141 300.708 316.184 293.5 350.5 293.5Z",

  // Stage 1: Logo icon paths
  logoIcon:
    "M350.02 200.5C366.513 200.5 381.682 202.852 393.729 206.791C405.798 210.738 414.647 216.25 418.616 222.505L418.649 222.556L418.692 222.598H418.693L418.712 222.617C418.727 222.632 418.751 222.656 418.781 222.688C418.843 222.751 418.935 222.848 419.054 222.979C419.292 223.242 419.635 223.641 420.048 224.179C420.875 225.253 421.983 226.88 423.092 229.075C425.309 233.464 427.537 240.133 427.537 249.219C427.537 263.88 428.438 279.377 428.798 285.044L428.817 285.33L428.851 285.348C428.926 285.989 428.967 286.629 428.967 287.27C428.967 297.179 420.326 306.306 405.989 312.986C391.694 319.647 371.91 323.781 350.029 323.781C328.149 323.781 308.366 319.647 294.07 312.986C279.734 306.306 271.093 297.179 271.093 287.27C271.093 286.532 271.142 285.805 271.238 285.089L271.242 285.054C271.602 279.387 272.503 263.89 272.503 249.229C272.503 240.138 274.731 233.47 276.948 229.082C278.058 226.887 279.165 225.261 279.991 224.188C280.405 223.651 280.748 223.252 280.986 222.989C281.104 222.858 281.196 222.761 281.258 222.697C281.289 222.666 281.312 222.642 281.327 222.627C281.335 222.62 281.341 222.615 281.344 222.611C281.346 222.61 281.347 222.608 281.348 222.607L281.391 222.566L281.423 222.515C285.393 216.26 294.242 210.745 306.312 206.796C318.358 202.854 333.527 200.5 350.02 200.5ZM401.808 252.976C398.105 252.642 393.836 253.596 389.863 255.889C385.891 258.181 382.929 261.399 381.366 264.77C379.853 268.033 379.636 271.484 381.159 274.348L381.312 274.623C382.995 277.539 386.177 279.169 389.877 279.504C393.58 279.839 397.849 278.887 401.821 276.594C405.794 274.301 408.755 271.084 410.319 267.713C411.881 264.344 412.061 260.776 410.373 257.859H410.372C408.689 254.939 405.508 253.309 401.808 252.976Z",
  logoBottom:
    "M446.774 262.993C463.599 274.321 473.56 288.588 473.56 304.023V355.459C473.56 373.562 459.875 390.065 437.495 402.071C415.136 414.066 384.213 421.5 350.029 421.5C315.846 421.5 284.923 414.066 262.564 402.071C240.185 390.065 226.5 373.563 226.5 355.46L226.62 306.841V306.821L226.618 306.802C226.549 305.88 226.5 304.954 226.5 304.023C226.5 303.03 226.549 302.035 226.628 301.046L226.63 301.025V301.006C227.83 286.735 237.555 273.588 253.265 263.01C253.001 271.669 252.559 279.334 252.309 283.336C252.156 284.655 252.086 285.973 252.086 287.25C252.086 292.324 253.195 299.624 258.006 307.379C262.818 315.135 271.313 323.312 286.029 330.169C303.447 338.288 326.168 342.742 350.02 342.742C373.871 342.742 396.593 338.288 414.011 330.169C428.727 323.312 437.221 315.135 442.033 307.379C446.844 299.624 447.953 292.324 447.953 287.25C447.953 285.972 447.873 284.657 447.731 283.336C447.481 279.326 447.047 271.653 446.774 262.993Z",
  dot: "M283.699 250.705C287.232 254.008 291.901 257.046 297.539 259.697C311.041 266.046 329.765 270 350.5 270C371.235 270 389.959 266.046 403.461 259.697C408.963 257.11 413.543 254.155 417.044 250.944C417.406 251.062 417.767 251.181 418.126 251.301C405.762 262.977 380.124 271 350.5 271C320.669 271 294.88 262.864 282.617 251.056C282.977 250.938 283.337 250.821 283.699 250.705ZM350.5 200C392.197 200 426 215.894 426 235.5C426 239.62 424.507 243.576 421.762 247.255C421.43 247.14 421.097 247.026 420.764 246.912C423.525 243.301 425 239.453 425 235.5C425 226.312 417.042 217.688 403.461 211.303C389.959 204.954 371.235 201 350.5 201C329.765 201 311.041 204.954 297.539 211.303C283.958 217.688 276 226.312 276 235.5C276 239.355 277.402 243.11 280.031 246.643C279.698 246.754 279.367 246.867 279.036 246.979C276.42 243.379 275 239.518 275 235.5C275 215.894 308.803 200 350.5 200Z",

  // Stage 2: Text paths (KNOBSMITH AUDIO wordmark)
  textK:
    "M551.766 262.695V302.584H564.103L564.238 302.296L582.73 262.695H599.71L578.07 308.563L577.971 308.772L578.066 308.982L600.795 359.414H583.266L564.101 316.475L563.969 316.179H551.756V359.414H536.019V262.695H551.766Z",
  textN:
    "M652.22 285.452C659.113 285.452 664.619 287.667 668.795 292.084L669.195 292.518C673.423 297.22 675.566 303.564 675.566 311.594V359.414H659.819V313.602C659.819 308.962 658.616 305.324 656.13 302.746C653.65 300.173 650.321 298.907 646.191 298.907C642.071 298.907 638.467 300.189 635.98 302.809C633.495 305.428 632.293 309.145 632.293 313.862V359.414H616.536V286.791H631.884V300.076L632.874 300.171C633.743 295.645 635.873 292.069 639.26 289.432V289.431C642.634 286.796 646.948 285.452 652.22 285.452Z",
  textO1:
    "M726.297 285.582C735.669 285.582 743.034 288.19 748.459 293.346C753.88 298.498 756.613 305.539 756.613 314.531V331.664C756.613 340.564 753.881 347.587 748.458 352.791C743.032 357.995 735.669 360.613 726.297 360.613C716.926 360.613 709.563 357.985 704.137 352.79C698.714 347.596 695.983 340.574 695.983 331.664V314.531C695.983 305.539 698.715 298.498 704.136 293.346C709.561 288.19 716.925 285.582 726.297 285.582ZM726.297 299.197C721.746 299.197 718.134 300.453 715.566 303.019C712.985 305.598 711.73 309.289 711.73 314.011V332.212C711.73 336.943 712.984 340.635 715.566 343.205V343.206C718.144 345.782 721.746 347.028 726.297 347.028C730.859 347.028 734.462 345.771 737.03 343.206C739.602 340.636 740.856 336.934 740.856 332.212V314.011C740.856 309.29 739.601 305.589 737.03 303.019C734.451 300.443 730.849 299.197 726.297 299.197Z",
  textB:
    "M793.046 262.695V282.798L792.507 299.66L793.484 299.824C794.886 295.28 797.307 291.758 800.74 289.241C804.171 286.726 808.373 285.452 813.373 285.452C820.479 285.452 826.135 287.945 830.411 292.91C834.692 297.88 836.858 304.625 836.858 313.202V333.151C836.858 341.636 834.673 348.331 830.353 353.303C826.138 358.152 820.656 360.64 813.883 360.756V360.753H813.383C808.29 360.753 804.071 359.477 800.683 356.965C797.301 354.45 794.94 350.931 793.627 346.389L792.646 346.527V359.414H777.299V262.695H793.046ZM807.084 298.917C802.698 298.917 799.211 300.251 796.736 302.965C794.256 305.673 793.056 309.466 793.056 314.281V331.953C793.056 336.768 794.256 340.562 796.736 343.269C799.221 345.982 802.697 347.317 807.084 347.317H807.584V347.288C811.728 347.2 815.028 346.018 817.411 343.678L817.412 343.679C819.915 341.231 821.111 337.5 821.111 332.612V313.602C821.111 308.714 819.914 304.984 817.412 302.536C814.924 300.103 811.454 298.917 807.084 298.917Z",
  textS:
    "M886.531 261.357C892.439 261.357 897.6 262.396 902.034 264.451L902.461 264.653C906.981 266.843 910.455 269.927 912.901 273.905C915.27 277.758 916.494 282.244 916.568 287.399H901.22C901.108 283.749 899.76 280.74 897.173 278.425C894.471 276.007 890.904 274.821 886.521 274.821C882.138 274.821 878.766 275.988 876.203 278.371C873.631 280.753 872.363 283.859 872.363 287.639C872.363 290.777 873.266 293.397 875.099 295.461V295.462C876.915 297.517 879.436 298.989 882.636 299.898L882.644 299.9L882.652 299.902L896.18 303.249C903.321 305.013 908.908 308.522 912.981 313.778C917.057 319.037 919.105 325.31 919.105 332.612C919.105 338.338 917.805 343.278 915.23 347.474C912.644 351.674 908.998 354.938 904.249 357.257C899.503 359.574 893.914 360.75 887.46 360.751C880.914 360.75 875.214 359.603 870.336 357.323C865.458 355.044 861.694 351.779 859.029 347.54L859.028 347.539C856.433 343.427 855.094 338.535 855.021 332.843H870.501C870.612 337.115 872.161 340.567 875.156 343.159C878.258 345.844 882.384 347.168 887.471 347.168C892.562 347.168 896.332 345.872 899.265 343.223V343.222C902.192 340.567 903.648 337.02 903.648 332.612C903.648 329.293 902.697 326.36 900.8 323.813C898.892 321.251 896.169 319.526 892.688 318.603L892.684 318.602L879.556 315.255L878.906 315.085C872.243 313.282 866.975 310.042 863.068 305.379C859.039 300.57 857.026 294.841 857.026 288.168C857.026 279.988 859.7 273.507 865.031 268.659C870.368 263.807 877.516 261.357 886.531 261.357Z",
  textM:
    "M985.806 285.452C990.122 285.452 993.682 287.141 996.54 290.557C999.4 293.976 1000.84 298.38 1000.84 303.822V359.414H987.105V305.031C987.105 302.55 986.528 300.527 985.313 299.032C984.085 297.519 982.352 296.769 980.166 296.769C978.041 296.769 976.371 297.46 975.25 298.903C974.148 300.322 973.638 302.393 973.638 305.031V359.414H961.239V305.031C961.239 302.559 960.717 300.542 959.601 299.047C958.463 297.525 956.804 296.769 954.71 296.769C952.461 296.769 950.693 297.452 949.502 298.89C948.326 300.311 947.781 302.387 947.781 305.031V359.414H934.063V286.791H947.002V297.5H948.365L948.4 297.037C948.663 293.572 949.871 290.783 952.004 288.652C954.132 286.525 956.822 285.452 960.09 285.452C963.361 285.452 965.969 286.459 968.192 288.469C970.423 290.487 971.948 293.227 972.729 296.709L973.715 296.65C974.065 293.184 975.33 290.468 977.505 288.466C979.681 286.464 982.435 285.452 985.806 285.452Z",
  textI1:
    "M1059.26 286.79V345.29H1081.91V359.414H1018.33V345.29H1043.52V300.915H1021.01V286.79H1059.26ZM1050.25 255.193C1053.36 255.194 1055.79 255.937 1057.61 257.378L1057.96 257.676C1059.8 259.307 1060.74 261.511 1060.74 264.333C1060.74 267.156 1059.81 269.35 1057.96 270.991C1056.11 272.628 1053.56 273.474 1050.25 273.474C1046.94 273.474 1044.39 272.628 1042.55 270.992L1042.55 270.991L1042.21 270.679C1040.59 269.083 1039.77 266.981 1039.77 264.333C1039.77 261.687 1040.59 259.593 1042.21 257.989L1042.55 257.675C1044.39 256.04 1046.94 255.193 1050.25 255.193Z",
  textT:
    "M1120.48 266.042V286.79H1149.83V300.915H1120.48V337.428C1120.48 339.664 1121.11 341.557 1122.42 343.042V343.041C1123.74 344.557 1125.56 345.29 1127.82 345.29H1149.16V359.414H1126.62C1119.84 359.414 1114.51 357.46 1110.55 353.603C1106.6 349.75 1104.61 344.504 1104.61 337.828V300.915H1084.24V286.79H1104.61V266.042H1120.48Z",
  textH:
    "M1176.62 262.695V286.29L1176.22 299.932L1177.21 300.04C1178.06 295.656 1180.08 292.184 1183.28 289.61L1183.6 289.364C1186.97 286.768 1191.29 285.452 1196.56 285.452C1203.45 285.452 1208.96 287.667 1213.14 292.084L1213.54 292.518C1217.76 297.22 1219.91 303.563 1219.91 311.594V359.414H1204.16V313.602C1204.16 308.962 1202.96 305.324 1200.47 302.746C1197.99 300.174 1194.66 298.906 1190.53 298.906C1186.41 298.906 1182.81 300.189 1180.32 302.809C1177.84 305.428 1176.63 309.144 1176.63 313.861V359.414H1160.88V262.695H1176.62Z",
  textA:
    "M1280.97 262.695L1305.5 359.414H1289.4L1284.12 336.108L1284.04 335.719H1257.24L1257.15 336.108L1251.88 359.414H1235.78L1260.18 262.695H1280.97ZM1270.15 276.697C1269.94 277.897 1269.62 279.637 1269.17 281.92L1268.68 284.384C1267.96 287.906 1267.12 291.807 1266.13 296.077L1266.13 296.081L1260.23 322.453L1260.1 323.062H1281.18L1281.04 322.453L1275.15 296.22C1274.17 291.847 1273.32 287.904 1272.6 284.382C1271.88 280.856 1271.39 278.297 1271.13 276.7L1270.15 276.697Z",
  textU:
    "M1337.13 286.79V331.933C1337.13 336.66 1338.31 340.4 1340.73 343.106C1343.17 345.823 1346.63 347.158 1351.03 347.158C1355.43 347.158 1358.76 345.829 1361.24 343.109L1361.24 343.108C1363.72 340.402 1364.92 336.651 1364.92 331.933V286.79H1380.67V332.073C1380.67 340.976 1377.98 347.958 1372.66 353.06C1367.32 358.176 1360.12 360.752 1351.03 360.752C1341.74 360.752 1334.51 358.175 1329.27 353.063C1324.02 347.951 1321.38 340.978 1321.38 332.073V286.79H1337.13Z",
  textD:
    "M1460.8 262.685V359.404H1445.45V346.518L1444.47 346.38C1443.16 350.932 1440.8 354.44 1437.41 356.955C1434.02 359.467 1429.81 360.743 1424.71 360.743H1424.21V360.746C1417.43 360.63 1411.96 358.143 1407.74 353.293C1403.42 348.322 1401.24 341.616 1401.24 333.142V313.192C1401.24 304.626 1403.4 297.881 1407.68 292.9C1411.96 287.935 1417.62 285.442 1424.72 285.442C1429.72 285.442 1433.92 286.717 1437.35 289.231C1440.79 291.748 1443.21 295.27 1444.61 299.814L1445.59 299.65L1445.05 282.788V262.685H1460.8ZM1431.01 298.896C1426.64 298.896 1423.16 300.082 1420.68 302.516C1418.18 304.963 1416.98 308.695 1416.98 313.582V332.593C1416.98 337.48 1418.18 341.212 1420.68 343.659C1423.08 345.999 1426.37 347.181 1430.51 347.268V347.298H1431.01C1435.41 347.298 1438.88 345.973 1441.36 343.249L1441.36 343.25C1443.84 340.542 1445.04 336.749 1445.04 331.934V314.262C1445.04 309.456 1443.83 305.653 1441.36 302.946L1441.36 302.945L1441.12 302.695C1438.66 300.15 1435.26 298.896 1431.01 298.896Z",
  textI2:
    "M1523.22 286.79V345.29H1545.86V359.414H1482.28V345.29H1507.47V300.915H1484.96V286.79H1523.22ZM1514.21 255.193C1517.31 255.194 1519.74 255.937 1521.56 257.378L1521.92 257.676C1523.76 259.307 1524.7 261.511 1524.7 264.333C1524.7 267.156 1523.76 269.35 1521.92 270.991C1520.06 272.628 1517.51 273.474 1514.21 273.474C1510.89 273.474 1508.35 272.628 1506.5 270.992L1506.5 270.991L1506.16 270.679C1504.54 269.083 1503.72 266.981 1503.72 264.333C1503.72 261.687 1504.54 259.593 1506.17 257.989L1506.5 257.675C1508.35 256.04 1510.89 255.193 1514.21 255.193Z",
  textO2:
    "M1592.19 285.582C1601.56 285.582 1608.92 288.19 1614.35 293.346C1619.77 298.498 1622.5 305.539 1622.5 314.531V331.664C1622.5 340.564 1619.77 347.587 1614.34 352.791C1608.92 357.995 1601.56 360.613 1592.19 360.613C1582.81 360.613 1575.45 357.985 1570.02 352.79C1564.6 347.596 1561.87 340.574 1561.87 331.664V314.531C1561.87 305.539 1564.6 298.498 1570.02 293.346C1575.45 288.19 1582.81 285.582 1592.19 285.582ZM1592.19 299.197C1587.63 299.197 1584.02 300.453 1581.45 303.019C1578.87 305.598 1577.62 309.289 1577.62 314.011V332.212C1577.62 336.943 1578.87 340.635 1581.45 343.205V343.206C1584.03 345.782 1587.63 347.028 1592.19 347.028C1596.75 347.028 1600.35 345.771 1602.92 343.206C1605.49 340.636 1606.74 336.934 1606.74 332.212V314.011C1606.74 309.29 1605.49 305.589 1602.92 303.019C1600.34 300.443 1596.74 299.197 1592.19 299.197Z",
};

export interface LogoConstructionProps {
  /** Duration of each stage in seconds */
  stageDuration?: number;
  /** Whether to loop the animation */
  loop?: boolean;
  /** Pause between loops in seconds */
  loopPause?: number;
  /** Drawing speed multiplier (lower = slower) */
  drawSpeed?: number;
  /** Accessible label for the animation */
  ariaLabel?: string;
  /** Optional className */
  className?: string;
}

export const LogoConstruction: React.FC<LogoConstructionProps> = ({
  stageDuration = 2,
  loop = true,
  loopPause = 3,
  drawSpeed = 1,
  ariaLabel = "KnobSmith Audio logo construction animation",
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Refs for each path element
  const ellipse1Ref = useRef<SVGPathElement>(null);
  const ellipse2Ref = useRef<SVGPathElement>(null);
  const ellipse3Ref = useRef<SVGPathElement>(null);
  const logoIconRef = useRef<SVGPathElement>(null);
  const logoBottomRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGPathElement>(null);

  // Text path refs
  const textKRef = useRef<SVGPathElement>(null);
  const textNRef = useRef<SVGPathElement>(null);
  const textO1Ref = useRef<SVGPathElement>(null);
  const textBRef = useRef<SVGPathElement>(null);
  const textSRef = useRef<SVGPathElement>(null);
  const textMRef = useRef<SVGPathElement>(null);
  const textI1Ref = useRef<SVGPathElement>(null);
  const textTRef = useRef<SVGPathElement>(null);
  const textHRef = useRef<SVGPathElement>(null);
  const textARef = useRef<SVGPathElement>(null);
  const textURef = useRef<SVGPathElement>(null);
  const textDRef = useRef<SVGPathElement>(null);
  const textI2Ref = useRef<SVGPathElement>(null);
  const textO2Ref = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Kill any existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Helper function to set up a path for drawing animation
    const setupPathForDrawing = (path: SVGPathElement | null) => {
      if (!path) return;
      const length = path.getTotalLength();
      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 1,
      });
    };

    // Helper function to animate drawing a path
    const drawPath = (
      tl: gsap.core.Timeline,
      path: SVGPathElement | null,
      duration: number,
      position?: string | number,
    ) => {
      if (!path) return;
      const length = path.getTotalLength();
      tl.to(
        path,
        {
          strokeDashoffset: 0,
          duration,
          ease: "power2.inOut",
        },
        position,
      );
    };

    // All path refs for setup
    const allPaths = [
      ellipse1Ref.current,
      ellipse2Ref.current,
      ellipse3Ref.current,
      logoIconRef.current,
      logoBottomRef.current,
      dotRef.current,
      textKRef.current,
      textNRef.current,
      textO1Ref.current,
      textBRef.current,
      textSRef.current,
      textMRef.current,
      textI1Ref.current,
      textTRef.current,
      textHRef.current,
      textARef.current,
      textURef.current,
      textDRef.current,
      textI2Ref.current,
      textO2Ref.current,
    ];

    const ctx = gsap.context(() => {
      // Set up all paths for drawing
      allPaths.forEach(setupPathForDrawing);

      // Create main timeline
      const tl = gsap.timeline({
        repeat: loop ? -1 : 0,
        repeatDelay: loopPause,
        onRepeat: () => {
          // Reset all paths on repeat
          allPaths.forEach(setupPathForDrawing);
        },
      });

      const baseDuration = 0.8 / drawSpeed;
      const stagger = 0.15 / drawSpeed;

      // Stage 0: Draw ellipses sequentially (top first, then middle, then bottom)
      drawPath(tl, ellipse1Ref.current, baseDuration, 0);
      drawPath(tl, ellipse2Ref.current, baseDuration, baseDuration);
      drawPath(tl, ellipse3Ref.current, baseDuration, baseDuration * 2);

      // Hold stage 0
      tl.to({}, { duration: stageDuration - baseDuration * 3 });

      // Stage 1: Draw logo construction
      const stage1Start = tl.duration();
      drawPath(tl, logoIconRef.current, baseDuration * 1.2, stage1Start);
      drawPath(
        tl,
        logoBottomRef.current,
        baseDuration * 1.2,
        stage1Start + stagger,
      );
      drawPath(
        tl,
        dotRef.current,
        baseDuration * 0.6,
        stage1Start + stagger * 2,
      );

      // Hold stage 1
      tl.to({}, { duration: stageDuration - baseDuration * 1.2 - stagger * 2 });

      // Stage 2: Draw text wordmark with staggered letters
      const stage2Start = tl.duration();
      const letterDuration = baseDuration * 0.5;
      const letterStagger = 0.08 / drawSpeed;

      // KNOBSMITH
      drawPath(tl, textKRef.current, letterDuration, stage2Start);
      drawPath(
        tl,
        textNRef.current,
        letterDuration,
        stage2Start + letterStagger,
      );
      drawPath(
        tl,
        textO1Ref.current,
        letterDuration,
        stage2Start + letterStagger * 2,
      );
      drawPath(
        tl,
        textBRef.current,
        letterDuration,
        stage2Start + letterStagger * 3,
      );
      drawPath(
        tl,
        textSRef.current,
        letterDuration,
        stage2Start + letterStagger * 4,
      );
      drawPath(
        tl,
        textMRef.current,
        letterDuration,
        stage2Start + letterStagger * 5,
      );
      drawPath(
        tl,
        textI1Ref.current,
        letterDuration,
        stage2Start + letterStagger * 6,
      );
      drawPath(
        tl,
        textTRef.current,
        letterDuration,
        stage2Start + letterStagger * 7,
      );
      drawPath(
        tl,
        textHRef.current,
        letterDuration,
        stage2Start + letterStagger * 8,
      );

      // AUDIO (with small gap)
      const audioStart = stage2Start + letterStagger * 10;
      drawPath(tl, textARef.current, letterDuration, audioStart);
      drawPath(
        tl,
        textURef.current,
        letterDuration,
        audioStart + letterStagger,
      );
      drawPath(
        tl,
        textDRef.current,
        letterDuration,
        audioStart + letterStagger * 2,
      );
      drawPath(
        tl,
        textI2Ref.current,
        letterDuration,
        audioStart + letterStagger * 3,
      );
      drawPath(
        tl,
        textO2Ref.current,
        letterDuration,
        audioStart + letterStagger * 4,
      );

      // Hold final state
      tl.to({}, { duration: stageDuration });

      timelineRef.current = tl;
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [stageDuration, loop, loopPause, drawSpeed]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className ?? ""}`}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        ref={svgRef}
        className={styles.svg}
        fill="none"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 1848 621"
      >
        <rect fill="#2B2F33" height="621" width="1848" />

        {/* Stage 0: Three ellipses (construction guides) */}
        <path
          ref={ellipse1Ref}
          d={svgPaths.ellipse1}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={ellipse2Ref}
          d={svgPaths.ellipse2}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={ellipse3Ref}
          d={svgPaths.ellipse3}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />

        {/* Stage 1: Logo construction */}
        <path
          ref={logoIconRef}
          d={svgPaths.logoIcon}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={logoBottomRef}
          d={svgPaths.logoBottom}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={dotRef}
          d={svgPaths.dot}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />

        {/* Stage 2: Text wordmark */}
        <path
          ref={textKRef}
          d={svgPaths.textK}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={textNRef}
          d={svgPaths.textN}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={textO1Ref}
          d={svgPaths.textO1}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={textBRef}
          d={svgPaths.textB}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={textSRef}
          d={svgPaths.textS}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={textMRef}
          d={svgPaths.textM}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={textI1Ref}
          d={svgPaths.textI1}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={textTRef}
          d={svgPaths.textT}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={textHRef}
          d={svgPaths.textH}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={textARef}
          d={svgPaths.textA}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={textURef}
          d={svgPaths.textU}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={textDRef}
          d={svgPaths.textD}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={textI2Ref}
          d={svgPaths.textI2}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
        <path
          ref={textO2Ref}
          d={svgPaths.textO2}
          stroke="white"
          strokeWidth="1"
          fill="none"
          opacity="0"
        />
      </svg>
    </div>
  );
};

export default LogoConstruction;
