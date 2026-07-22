import type { Meta, StoryObj } from "@storybook/react-vite";
import React, { useMemo, useState } from "react";
import Icon from "@dt/Icon";
import Toast from "@dt/Toast";
import styles from "./Documentation.module.css";
import {
  filterBrowsableIconNames,
  resolveBrowserPhosphorIcon,
} from "./iconBrowserPhosphor";

// Comprehensive list of all Phosphor icons (1515 icons)
const ALL_ICON_NAMES = [
  "Acorn",
  "AddressBook",
  "AddressBookTabs",
  "AirTrafficControl",
  "Airplane",
  "AirplaneInFlight",
  "AirplaneLanding",
  "AirplaneTakeoff",
  "AirplaneTaxiing",
  "AirplaneTilt",
  "Airplay",
  "Alarm",
  "Alien",
  "AlignBottom",
  "AlignBottomSimple",
  "AlignCenterHorizontal",
  "AlignCenterHorizontalSimple",
  "AlignCenterVertical",
  "AlignCenterVerticalSimple",
  "AlignLeft",
  "AlignLeftSimple",
  "AlignRight",
  "AlignRightSimple",
  "AlignTop",
  "AlignTopSimple",
  "AmazonLogo",
  "Ambulance",
  "Anchor",
  "AnchorSimple",
  "AndroidLogo",
  "Angle",
  "AngularLogo",
  "Aperture",
  "AppStoreLogo",
  "AppWindow",
  "AppleLogo",
  "ApplePodcastsLogo",
  "ApproximateEquals",
  "Archive",
  "Armchair",
  "ArrowArcLeft",
  "ArrowArcRight",
  "ArrowBendDoubleUpLeft",
  "ArrowBendDoubleUpRight",
  "ArrowBendDownLeft",
  "ArrowBendDownRight",
  "ArrowBendLeftDown",
  "ArrowBendLeftUp",
  "ArrowBendRightDown",
  "ArrowBendRightUp",
  "ArrowBendUpLeft",
  "ArrowBendUpRight",
  "ArrowCircleDown",
  "ArrowCircleDownLeft",
  "ArrowCircleDownRight",
  "ArrowCircleLeft",
  "ArrowCircleRight",
  "ArrowCircleUp",
  "ArrowCircleUpLeft",
  "ArrowCircleUpRight",
  "ArrowClockwise",
  "ArrowCounterClockwise",
  "ArrowDown",
  "ArrowDownLeft",
  "ArrowDownRight",
  "ArrowElbowDownLeft",
  "ArrowElbowDownRight",
  "ArrowElbowLeft",
  "ArrowElbowLeftDown",
  "ArrowElbowLeftUp",
  "ArrowElbowRight",
  "ArrowElbowRightDown",
  "ArrowElbowRightUp",
  "ArrowElbowUpLeft",
  "ArrowElbowUpRight",
  "ArrowFatDown",
  "ArrowFatLeft",
  "ArrowFatLineDown",
  "ArrowFatLineLeft",
  "ArrowFatLineRight",
  "ArrowFatLineUp",
  "ArrowFatLinesDown",
  "ArrowFatLinesLeft",
  "ArrowFatLinesRight",
  "ArrowFatLinesUp",
  "ArrowFatRight",
  "ArrowFatUp",
  "ArrowLeft",
  "ArrowLineDown",
  "ArrowLineDownLeft",
  "ArrowLineDownRight",
  "ArrowLineLeft",
  "ArrowLineRight",
  "ArrowLineUp",
  "ArrowLineUpLeft",
  "ArrowLineUpRight",
  "ArrowRight",
  "ArrowSquareDown",
  "ArrowSquareDownLeft",
  "ArrowSquareDownRight",
  "ArrowSquareIn",
  "ArrowSquareLeft",
  "ArrowSquareOut",
  "ArrowSquareRight",
  "ArrowSquareUp",
  "ArrowSquareUpLeft",
  "ArrowSquareUpRight",
  "ArrowUDownLeft",
  "ArrowUDownRight",
  "ArrowULeftDown",
  "ArrowULeftUp",
  "ArrowURightDown",
  "ArrowURightUp",
  "ArrowUUpLeft",
  "ArrowUUpRight",
  "ArrowUp",
  "ArrowUpLeft",
  "ArrowUpRight",
  "ArrowsClockwise",
  "ArrowsCounterClockwise",
  "ArrowsDownUp",
  "ArrowsHorizontal",
  "ArrowsIn",
  "ArrowsInCardinal",
  "ArrowsInLineHorizontal",
  "ArrowsInLineVertical",
  "ArrowsInSimple",
  "ArrowsLeftRight",
  "ArrowsMerge",
  "ArrowsOut",
  "ArrowsOutCardinal",
  "ArrowsOutLineHorizontal",
  "ArrowsOutLineVertical",
  "ArrowsOutSimple",
  "ArrowsSplit",
  "ArrowsVertical",
  "Article",
  "ArticleMedium",
  "ArticleNyTimes",
  "Asclepius",
  "Asterisk",
  "AsteriskSimple",
  "At",
  "Atom",
  "Avocado",
  "Axe",
  "Baby",
  "BabyCarriage",
  "Backpack",
  "Backspace",
  "Bag",
  "BagSimple",
  "Balloon",
  "Bandaids",
  "Bank",
  "Barbell",
  "Barcode",
  "Barn",
  "Barricade",
  "Baseball",
  "BaseballCap",
  "BaseballHelmet",
  "Basket",
  "Basketball",
  "Bathtub",
  "BatteryCharging",
  "BatteryChargingVertical",
  "BatteryEmpty",
  "BatteryFull",
  "BatteryHigh",
  "BatteryLow",
  "BatteryMedium",
  "BatteryPlus",
  "BatteryPlusVertical",
  "BatteryVerticalEmpty",
  "BatteryVerticalFull",
  "BatteryVerticalHigh",
  "BatteryVerticalLow",
  "BatteryVerticalMedium",
  "BatteryWarning",
  "BatteryWarningVertical",
  "BeachBall",
  "Beanie",
  "Bed",
  "BeerBottle",
  "BeerStein",
  "BehanceLogo",
  "Bell",
  "BellRinging",
  "BellSimple",
  "BellSimpleRinging",
  "BellSimpleSlash",
  "BellSimpleZ",
  "BellSlash",
  "BellZ",
  "Belt",
  "BezierCurve",
  "Bicycle",
  "Binary",
  "Binoculars",
  "Biohazard",
  "Bird",
  "Blueprint",
  "Bluetooth",
  "BluetoothConnected",
  "BluetoothSlash",
  "BluetoothX",
  "Boat",
  "Bomb",
  "Bone",
  "Book",
  "BookBookmark",
  "BookOpen",
  "BookOpenText",
  "BookOpenUser",
  "Bookmark",
  "BookmarkSimple",
  "Bookmarks",
  "BookmarksSimple",
  "Books",
  "Boot",
  "Boules",
  "BoundingBox",
  "BowlFood",
  "BowlSteam",
  "BowlingBall",
  "BoxArrowDown",
  "BoxArrowUp",
  "BoxingGlove",
  "BracketsAngle",
  "BracketsCurly",
  "BracketsRound",
  "BracketsSquare",
  "Brain",
  "Brandy",
  "Bread",
  "Bridge",
  "Briefcase",
  "BriefcaseMetal",
  "Broadcast",
  "Broom",
  "Browser",
  "Browsers",
  "Bug",
  "BugBeetle",
  "BugDroid",
  "Building",
  "BuildingApartment",
  "BuildingOffice",
  "Buildings",
  "Bulldozer",
  "Bus",
  "Butterfly",
  "CableCar",
  "Cactus",
  "Cake",
  "Calculator",
  "Calendar",
  "CalendarBlank",
  "CalendarCheck",
  "CalendarDot",
  "CalendarDots",
  "CalendarHeart",
  "CalendarMinus",
  "CalendarPlus",
  "CalendarSlash",
  "CalendarStar",
  "CalendarX",
  "CallBell",
  "Camera",
  "CameraPlus",
  "CameraRotate",
  "CameraSlash",
  "Campfire",
  "Car",
  "CarBattery",
  "CarProfile",
  "CarSimple",
  "Cardholder",
  "Cards",
  "CardsThree",
  "CaretCircleDoubleDown",
  "CaretCircleDoubleLeft",
  "CaretCircleDoubleRight",
  "CaretCircleDoubleUp",
  "CaretCircleDown",
  "CaretCircleLeft",
  "CaretCircleRight",
  "CaretCircleUp",
  "CaretCircleUpDown",
  "CaretDoubleDown",
  "CaretDoubleLeft",
  "CaretDoubleRight",
  "CaretDoubleUp",
  "CaretDown",
  "CaretLeft",
  "CaretLineDown",
  "CaretLineLeft",
  "CaretLineRight",
  "CaretLineUp",
  "CaretRight",
  "CaretUp",
  "CaretUpDown",
  "Carrot",
  "CashRegister",
  "CassetteTape",
  "CastleTurret",
  "Cat",
  "CellSignalFull",
  "CellSignalHigh",
  "CellSignalLow",
  "CellSignalMedium",
  "CellSignalNone",
  "CellSignalSlash",
  "CellSignalX",
  "CellTower",
  "Certificate",
  "Chair",
  "Chalkboard",
  "ChalkboardSimple",
  "ChalkboardTeacher",
  "Champagne",
  "ChargingStation",
  "ChartBar",
  "ChartBarHorizontal",
  "ChartDonut",
  "ChartLine",
  "ChartLineDown",
  "ChartLineUp",
  "ChartPie",
  "ChartPieSlice",
  "ChartPolar",
  "ChartScatter",
  "Chat",
  "ChatCentered",
  "ChatCenteredDots",
  "ChatCenteredSlash",
  "ChatCenteredText",
  "ChatCircle",
  "ChatCircleDots",
  "ChatCircleSlash",
  "ChatCircleText",
  "ChatDots",
  "ChatSlash",
  "ChatTeardrop",
  "ChatTeardropDots",
  "ChatTeardropSlash",
  "ChatTeardropText",
  "ChatText",
  "Chats",
  "ChatsCircle",
  "ChatsTeardrop",
  "Check",
  "CheckCircle",
  "CheckFat",
  "CheckSquare",
  "CheckSquareOffset",
  "Checkerboard",
  "Checks",
  "Cheers",
  "Cheese",
  "ChefHat",
  "Cherries",
  "Church",
  "Cigarette",
  "CigaretteSlash",
  "Circle",
  "CircleDashed",
  "CircleHalf",
  "CircleHalfTilt",
  "CircleNotch",
  "CirclesFour",
  "CirclesThree",
  "CirclesThreePlus",
  "Circuitry",
  "City",
  "Clipboard",
  "ClipboardText",
  "Clock",
  "ClockAfternoon",
  "ClockClockwise",
  "ClockCountdown",
  "ClockCounterClockwise",
  "ClockUser",
  "ClosedCaptioning",
  "Cloud",
  "CloudArrowDown",
  "CloudArrowUp",
  "CloudCheck",
  "CloudFog",
  "CloudLightning",
  "CloudMoon",
  "CloudRain",
  "CloudSlash",
  "CloudSnow",
  "CloudSun",
  "CloudWarning",
  "CloudX",
  "Clover",
  "Club",
  "CoatHanger",
  "CodaLogo",
  "Code",
  "CodeBlock",
  "CodeSimple",
  "CodepenLogo",
  "CodesandboxLogo",
  "Coffee",
  "CoffeeBean",
  "Coin",
  "CoinVertical",
  "Coins",
  "Columns",
  "ColumnsPlusLeft",
  "ColumnsPlusRight",
  "Command",
  "Compass",
  "CompassRose",
  "CompassTool",
  "ComputerTower",
  "Confetti",
  "ContactlessPayment",
  "Control",
  "Cookie",
  "CookingPot",
  "Copy",
  "CopySimple",
  "Copyleft",
  "Copyright",
  "CornersIn",
  "CornersOut",
  "Couch",
  "CourtBasketball",
  "Cow",
  "CowboyHat",
  "Cpu",
  "Crane",
  "CraneTower",
  "CreditCard",
  "Cricket",
  "Crop",
  "Cross",
  "Crosshair",
  "CrosshairSimple",
  "Crown",
  "CrownCross",
  "CrownSimple",
  "Cube",
  "CubeFocus",
  "CubeTransparent",
  "CurrencyBtc",
  "CurrencyCircleDollar",
  "CurrencyCny",
  "CurrencyDollar",
  "CurrencyDollarSimple",
  "CurrencyEth",
  "CurrencyEur",
  "CurrencyGbp",
  "CurrencyInr",
  "CurrencyJpy",
  "CurrencyKrw",
  "CurrencyKzt",
  "CurrencyNgn",
  "CurrencyRub",
  "Cursor",
  "CursorClick",
  "CursorText",
  "Cylinder",
  "Database",
  "Desk",
  "Desktop",
  "DesktopTower",
  "Detective",
  "DevToLogo",
  "DeviceMobile",
  "DeviceMobileCamera",
  "DeviceMobileSlash",
  "DeviceMobileSpeaker",
  "DeviceRotate",
  "DeviceTablet",
  "DeviceTabletCamera",
  "DeviceTabletSpeaker",
  "Devices",
  "Diamond",
  "DiamondsFour",
  "DiceFive",
  "DiceFour",
  "DiceOne",
  "DiceSix",
  "DiceThree",
  "DiceTwo",
  "Disc",
  "DiscoBall",
  "DiscordLogo",
  "Divide",
  "Dna",
  "Dog",
  "Door",
  "DoorOpen",
  "Dot",
  "DotOutline",
  "DotsNine",
  "DotsSix",
  "DotsSixVertical",
  "DotsThree",
  "DotsThreeCircle",
  "DotsThreeCircleVertical",
  "DotsThreeOutline",
  "DotsThreeOutlineVertical",
  "DotsThreeVertical",
  "Download",
  "DownloadSimple",
  "Dress",
  "Dresser",
  "DribbbleLogo",
  "Drone",
  "Drop",
  "DropHalf",
  "DropHalfBottom",
  "DropSimple",
  "DropSlash",
  "DropboxLogo",
  "Ear",
  "EarSlash",
  "Egg",
  "EggCrack",
  "Eject",
  "EjectSimple",
  "Elevator",
  "Empty",
  "Engine",
  "Envelope",
  "EnvelopeOpen",
  "EnvelopeSimple",
  "EnvelopeSimpleOpen",
  "Equalizer",
  "Equals",
  "Eraser",
  "EscalatorDown",
  "EscalatorUp",
  "Exam",
  "ExclamationMark",
  "Exclude",
  "ExcludeSquare",
  "Export",
  "Eye",
  "EyeClosed",
  "EyeSlash",
  "Eyedropper",
  "EyedropperSample",
  "Eyeglasses",
  "Eyes",
  "FaceMask",
  "FacebookLogo",
  "Factory",
  "Faders",
  "FadersHorizontal",
  "FalloutShelter",
  "Fan",
  "Farm",
  "FastForward",
  "FastForwardCircle",
  "Feather",
  "FediverseLogo",
  "FigmaLogo",
  "File",
  "FileArchive",
  "FileArrowDown",
  "FileArrowUp",
  "FileAudio",
  "FileC",
  "FileCSharp",
  "FileCloud",
  "FileCode",
  "FileCpp",
  "FileCss",
  "FileCsv",
  "FileDashed",
  "FileDoc",
  "FileHtml",
  "FileImage",
  "FileIni",
  "FileJpg",
  "FileJs",
  "FileJsx",
  "FileLock",
  "FileMagnifyingGlass",
  "FileMd",
  "FileMinus",
  "FilePdf",
  "FilePlus",
  "FilePng",
  "FilePpt",
  "FilePy",
  "FileRs",
  "FileSql",
  "FileSvg",
  "FileText",
  "FileTs",
  "FileTsx",
  "FileTxt",
  "FileVideo",
  "FileVue",
  "FileX",
  "FileXls",
  "FileZip",
  "Files",
  "FilmReel",
  "FilmScript",
  "FilmSlate",
  "FilmStrip",
  "Fingerprint",
  "FingerprintSimple",
  "FinnTheHuman",
  "Fire",
  "FireExtinguisher",
  "FireSimple",
  "FireTruck",
  "FirstAid",
  "FirstAidKit",
  "Fish",
  "FishSimple",
  "Flag",
  "FlagBanner",
  "FlagBannerFold",
  "FlagCheckered",
  "FlagPennant",
  "Flame",
  "Flashlight",
  "Flask",
  "FlipHorizontal",
  "FlipVertical",
  "FloppyDisk",
  "FloppyDiskBack",
  "FlowArrow",
  "Flower",
  "FlowerLotus",
  "FlowerTulip",
  "FlyingSaucer",
  "Folder",
  "FolderDashed",
  "FolderLock",
  "FolderMinus",
  "FolderOpen",
  "FolderPlus",
  "FolderSimple",
  "FolderSimpleDashed",
  "FolderSimpleLock",
  "FolderSimpleMinus",
  "FolderSimplePlus",
  "FolderSimpleStar",
  "FolderSimpleUser",
  "FolderStar",
  "FolderUser",
  "Folders",
  "Football",
  "FootballHelmet",
  "Footprints",
  "ForkKnife",
  "FourK",
  "FrameCorners",
  "FramerLogo",
  "Function",
  "Funnel",
  "FunnelSimple",
  "FunnelSimpleX",
  "FunnelX",
  "GameController",
  "Garage",
  "GasCan",
  "GasPump",
  "Gauge",
  "Gavel",
  "Gear",
  "GearFine",
  "GearSix",
  "GenderFemale",
  "GenderIntersex",
  "GenderMale",
  "GenderNeuter",
  "GenderNonbinary",
  "GenderTransgender",
  "Ghost",
  "Gif",
  "Gift",
  "GitBranch",
  "GitCommit",
  "GitDiff",
  "GitFork",
  "GitMerge",
  "GitPullRequest",
  "GithubLogo",
  "GitlabLogo",
  "GitlabLogoSimple",
  "Globe",
  "GlobeHemisphereEast",
  "GlobeHemisphereWest",
  "GlobeSimple",
  "GlobeSimpleX",
  "GlobeStand",
  "GlobeX",
  "Goggles",
  "Golf",
  "GoodreadsLogo",
  "GoogleCardboardLogo",
  "GoogleChromeLogo",
  "GoogleDriveLogo",
  "GoogleLogo",
  "GooglePhotosLogo",
  "GooglePlayLogo",
  "GooglePodcastsLogo",
  "Gps",
  "GpsFix",
  "GpsSlash",
  "Gradient",
  "GraduationCap",
  "Grains",
  "GrainsSlash",
  "Graph",
  "GraphicsCard",
  "GreaterThan",
  "GreaterThanOrEqual",
  "GridFour",
  "GridNine",
  "Guitar",
  "HairDryer",
  "Hamburger",
  "Hammer",
  "Hand",
  "HandArrowDown",
  "HandArrowUp",
  "HandCoins",
  "HandDeposit",
  "HandEye",
  "HandFist",
  "HandGrabbing",
  "HandHeart",
  "HandPalm",
  "HandPeace",
  "HandPointing",
  "HandSoap",
  "HandSwipeLeft",
  "HandSwipeRight",
  "HandTap",
  "HandWaving",
  "HandWithdraw",
  "Handbag",
  "HandbagSimple",
  "HandsClapping",
  "HandsPraying",
  "Handshake",
  "HardDrive",
  "HardDrives",
  "HardHat",
  "Hash",
  "HashStraight",
  "HeadCircuit",
  "Headlights",
  "Headphones",
  "Headset",
  "Heart",
  "HeartBreak",
  "HeartHalf",
  "HeartStraight",
  "HeartStraightBreak",
  "Heartbeat",
  "Hexagon",
  "HighDefinition",
  "HighHeel",
  "Highlighter",
  "HighlighterCircle",
  "Hockey",
  "Hoodie",
  "Horse",
  "Hospital",
  "Hourglass",
  "HourglassHigh",
  "HourglassLow",
  "HourglassMedium",
  "HourglassSimple",
  "HourglassSimpleHigh",
  "HourglassSimpleLow",
  "HourglassSimpleMedium",
  "House",
  "HouseLine",
  "HouseSimple",
  "Hurricane",
  "IceCream",
  "IdentificationBadge",
  "IdentificationCard",
  "Image",
  "ImageBroken",
  "ImageSquare",
  "Images",
  "ImagesSquare",
  "Infinity",
  "Info",
  "InstagramLogo",
  "Intersect",
  "IntersectSquare",
  "IntersectThree",
  "Intersection",
  "Invoice",
  "Island",
  "Jar",
  "JarLabel",
  "Jeep",
  "Joystick",
  "Kanban",
  "Key",
  "KeyReturn",
  "Keyboard",
  "Keyhole",
  "Knife",
  "Ladder",
  "LadderSimple",
  "Lamp",
  "LampPendant",
  "Laptop",
  "Lasso",
  "LastfmLogo",
  "Layout",
  "Leaf",
  "Lectern",
  "Lego",
  "LegoSmiley",
  "LessThan",
  "LessThanOrEqual",
  "LetterCircleH",
  "LetterCircleP",
  "LetterCircleV",
  "Lifebuoy",
  "Lightbulb",
  "LightbulbFilament",
  "Lighthouse",
  "Lightning",
  "LightningA",
  "LightningSlash",
  "LineSegment",
  "LineSegments",
  "LineVertical",
  "Link",
  "LinkBreak",
  "LinkSimple",
  "LinkSimpleBreak",
  "LinkSimpleHorizontal",
  "LinkSimpleHorizontalBreak",
  "LinkedinLogo",
  "LinktreeLogo",
  "LinuxLogo",
  "List",
  "ListBullets",
  "ListChecks",
  "ListDashes",
  "ListHeart",
  "ListMagnifyingGlass",
  "ListNumbers",
  "ListPlus",
  "ListStar",
  "Lock",
  "LockKey",
  "LockKeyOpen",
  "LockLaminated",
  "LockLaminatedOpen",
  "LockOpen",
  "LockSimple",
  "LockSimpleOpen",
  "Lockers",
  "Log",
  "MagicWand",
  "Magnet",
  "MagnetStraight",
  "MagnifyingGlass",
  "MagnifyingGlassMinus",
  "MagnifyingGlassPlus",
  "Mailbox",
  "Map",
  "MapPin",
  "MapPinArea",
  "MapPinLine",
  "MapPinPlus",
  "MapPinSimple",
  "MapPinSimpleArea",
  "MapPinSimpleLine",
  "MapTrifold",
  "MarkdownLogo",
  "MarkerCircle",
  "Martini",
  "MaskHappy",
  "MaskSad",
  "MastodonLogo",
  "MathOperations",
  "MatrixLogo",
  "Medal",
  "MedalMilitary",
  "MediumLogo",
  "Megaphone",
  "MegaphoneSimple",
  "MemberOf",
  "Memory",
  "MessengerLogo",
  "MetaLogo",
  "Meteor",
  "Metronome",
  "Microphone",
  "MicrophoneSlash",
  "MicrophoneStage",
  "Microscope",
  "MicrosoftExcelLogo",
  "MicrosoftOutlookLogo",
  "MicrosoftPowerpointLogo",
  "MicrosoftTeamsLogo",
  "MicrosoftWordLogo",
  "Minus",
  "MinusCircle",
  "MinusSquare",
  "Money",
  "MoneyWavy",
  "Monitor",
  "MonitorArrowUp",
  "MonitorPlay",
  "Moon",
  "MoonStars",
  "Moped",
  "MopedFront",
  "Mosque",
  "Motorcycle",
  "Mountains",
  "Mouse",
  "MouseLeftClick",
  "MouseMiddleClick",
  "MouseRightClick",
  "MouseScroll",
  "MouseSimple",
  "MusicNote",
  "MusicNoteSimple",
  "MusicNotes",
  "MusicNotesDouble",
  "MusicNotesMinus",
  "MusicNotesPlus",
  "MusicNotesSimple",
  "NavigationArrow",
  "Needle",
  "Network",
  "NetworkSlash",
  "NetworkX",
  "Newspaper",
  "NewspaperClipping",
  "NotEquals",
  "NotMemberOf",
  "NotSubsetOf",
  "NotSupersetOf",
  "Notches",
  "Note",
  "NoteBlank",
  "NotePencil",
  "Notebook",
  "Notepad",
  "Notification",
  "NotionLogo",
  "NuclearPlant",
  "NumberCircleEight",
  "NumberCircleFive",
  "NumberCircleFour",
  "NumberCircleNine",
  "NumberCircleOne",
  "NumberCircleSeven",
  "NumberCircleSix",
  "NumberCircleThree",
  "NumberCircleTwo",
  "NumberCircleZero",
  "NumberEight",
  "NumberFive",
  "NumberFour",
  "NumberNine",
  "NumberOne",
  "NumberSeven",
  "NumberSix",
  "NumberSquareEight",
  "NumberSquareFive",
  "NumberSquareFour",
  "NumberSquareNine",
  "NumberSquareOne",
  "NumberSquareSeven",
  "NumberSquareSix",
  "NumberSquareThree",
  "NumberSquareTwo",
  "NumberSquareZero",
  "NumberThree",
  "NumberTwo",
  "NumberZero",
  "Numpad",
  "Nut",
  "NyTimesLogo",
  "Octagon",
  "OfficeChair",
  "Onigiri",
  "OpenAiLogo",
  "Option",
  "Orange",
  "OrangeSlice",
  "Oven",
  "Package",
  "PaintBrush",
  "PaintBrushBroad",
  "PaintBrushHousehold",
  "PaintBucket",
  "PaintRoller",
  "Palette",
  "Panorama",
  "Pants",
  "PaperPlane",
  "PaperPlaneRight",
  "PaperPlaneTilt",
  "Paperclip",
  "PaperclipHorizontal",
  "Parachute",
  "Paragraph",
  "Parallelogram",
  "Park",
  "Password",
  "Path",
  "PatreonLogo",
  "Pause",
  "PauseCircle",
  "PawPrint",
  "PaypalLogo",
  "Peace",
  "Pen",
  "PenNib",
  "PenNibStraight",
  "Pencil",
  "PencilCircle",
  "PencilLine",
  "PencilRuler",
  "PencilSimple",
  "PencilSimpleLine",
  "PencilSimpleSlash",
  "PencilSlash",
  "Pentagon",
  "Pentagram",
  "Pepper",
  "Percent",
  "Person",
  "PersonArmsSpread",
  "PersonSimple",
  "PersonSimpleBike",
  "PersonSimpleCircle",
  "PersonSimpleHike",
  "PersonSimpleRun",
  "PersonSimpleSki",
  "PersonSimpleSnowboard",
  "PersonSimpleSwim",
  "PersonSimpleTaiChi",
  "PersonSimpleThrow",
  "PersonSimpleWalk",
  "Perspective",
  "Phone",
  "PhoneCall",
  "PhoneDisconnect",
  "PhoneIncoming",
  "PhoneList",
  "PhoneOutgoing",
  "PhonePause",
  "PhonePlus",
  "PhoneSlash",
  "PhoneTransfer",
  "PhoneX",
  "PhosphorLogo",
  "Pi",
  "PianoKeys",
  "PicnicTable",
  "PictureInPicture",
  "PiggyBank",
  "Pill",
  "PingPong",
  "PintGlass",
  "PinterestLogo",
  "Pinwheel",
  "Pipe",
  "PipeWrench",
  "PixLogo",
  "Pizza",
  "Placeholder",
  "Planet",
  "Plant",
  "Play",
  "PlayCircle",
  "PlayPause",
  "Playlist",
  "Plug",
  "PlugCharging",
  "Plugs",
  "PlugsConnected",
  "Plus",
  "PlusCircle",
  "PlusMinus",
  "PlusSquare",
  "PokerChip",
  "PoliceCar",
  "Polygon",
  "Popcorn",
  "Popsicle",
  "PottedPlant",
  "Power",
  "Prescription",
  "Presentation",
  "PresentationChart",
  "Printer",
  "Prohibit",
  "ProhibitInset",
  "ProjectorScreen",
  "ProjectorScreenChart",
  "Pulse",
  "PushPin",
  "PushPinSimple",
  "PushPinSimpleSlash",
  "PushPinSlash",
  "PuzzlePiece",
  "QrCode",
  "Question",
  "QuestionMark",
  "Queue",
  "Quotes",
  "Rabbit",
  "Racquet",
  "Radical",
  "Radio",
  "RadioButton",
  "Radioactive",
  "Rainbow",
  "RainbowCloud",
  "Ranking",
  "ReadCvLogo",
  "Receipt",
  "ReceiptX",
  "Record",
  "Rectangle",
  "RectangleDashed",
  "Recycle",
  "RedditLogo",
  "Repeat",
  "RepeatOnce",
  "ReplitLogo",
  "Resize",
  "Rewind",
  "RewindCircle",
  "RoadHorizon",
  "Robot",
  "Rocket",
  "RocketLaunch",
  "Rows",
  "RowsPlusBottom",
  "RowsPlusTop",
  "Rss",
  "RssSimple",
  "Rug",
  "Ruler",
  "Sailboat",
  "Scales",
  "Scan",
  "ScanSmiley",
  "Scissors",
  "Scooter",
  "Screencast",
  "Screwdriver",
  "Scribble",
  "ScribbleLoop",
  "Scroll",
  "Seal",
  "SealCheck",
  "SealPercent",
  "SealQuestion",
  "SealWarning",
  "Seat",
  "Seatbelt",
  "SecurityCamera",
  "Selection",
  "SelectionAll",
  "SelectionBackground",
  "SelectionForeground",
  "SelectionInverse",
  "SelectionPlus",
  "SelectionSlash",
  "Shapes",
  "Share",
  "ShareFat",
  "ShareNetwork",
  "Shield",
  "ShieldCheck",
  "ShieldCheckered",
  "ShieldChevron",
  "ShieldPlus",
  "ShieldSlash",
  "ShieldStar",
  "ShieldWarning",
  "ShippingContainer",
  "ShirtFolded",
  "ShootingStar",
  "ShoppingBag",
  "ShoppingBagOpen",
  "ShoppingCart",
  "ShoppingCartSimple",
  "Shovel",
  "Shower",
  "Shrimp",
  "Shuffle",
  "ShuffleAngular",
  "ShuffleSimple",
  "Sidebar",
  "SidebarSimple",
  "Sigma",
  "SignIn",
  "SignOut",
  "Signature",
  "Signpost",
  "SimCard",
  "Siren",
  "SketchLogo",
  "SkipBack",
  "SkipBackCircle",
  "SkipForward",
  "SkipForwardCircle",
  "Skull",
  "SkypeLogo",
  "SlackLogo",
  "Sliders",
  "SlidersHorizontal",
  "Slideshow",
  "SmileyAngry",
  "SmileyBlank",
  "SmileyMeh",
  "SmileyMelting",
  "SmileyNervous",
  "SmileySad",
  "SmileySticker",
  "SmileyWink",
  "SmileyXEyes",
  "Smiley",
  "SnapchatLogo",
  "Sneaker",
  "SneakerMove",
  "Snowflake",
  "SoccerBall",
  "Sock",
  "SolarPanel",
  "SolarRoof",
  "SortAscending",
  "SortDescending",
  "SoundcloudLogo",
  "Spade",
  "Sparkle",
  "SpeakerHifi",
  "SpeakerHigh",
  "SpeakerLow",
  "SpeakerNone",
  "SpeakerSimpleHigh",
  "SpeakerSimpleLow",
  "SpeakerSimpleNone",
  "SpeakerSimpleSlash",
  "SpeakerSimpleX",
  "SpeakerSlash",
  "SpeakerX",
  "Speedometer",
  "Sphere",
  "Spinner",
  "SpinnerBall",
  "SpinnerGap",
  "Spiral",
  "SplitHorizontal",
  "SplitVertical",
  "SpotifyLogo",
  "SprayBottle",
  "Square",
  "SquareHalf",
  "SquareHalfBottom",
  "SquareLogo",
  "SquareSplitHorizontal",
  "SquareSplitVertical",
  "SquaresFour",
  "Stack",
  "StackMinus",
  "StackOverflowLogo",
  "StackPlus",
  "StackSimple",
  "Stairs",
  "Stamp",
  "StandardDefinition",
  "Star",
  "StarAndCrescent",
  "StarFour",
  "StarHalf",
  "StarOfDavid",
  "SteamLogo",
  "SteeringWheel",
  "Steps",
  "Stethoscope",
  "Sticker",
  "Stool",
  "Stop",
  "StopCircle",
  "Storefront",
  "Strategy",
  "StripeLogo",
  "Student",
  "SubsetOf",
  "SubsetProperOf",
  "Subtitles",
  "SubtitlesSlash",
  "Subtract",
  "SubtractSquare",
  "Subway",
  "Suitcase",
  "SuitcaseRolling",
  "SuitcaseSimple",
  "Sun",
  "SunDim",
  "SunHorizon",
  "Sunglasses",
  "SupersetOf",
  "SupersetProperOf",
  "Swap",
  "Swatches",
  "SwimmingPool",
  "Sword",
  "Synagogue",
  "Syringe",
  "TShirt",
  "Table",
  "Tabs",
  "Tag",
  "TagChevron",
  "TagSimple",
  "Target",
  "Taxi",
  "TeaBag",
  "TelegramLogo",
  "Television",
  "TelevisionSimple",
  "TennisBall",
  "Tent",
  "Terminal",
  "TerminalWindow",
  "TestTube",
  "TextAUnderline",
  "TextAa",
  "TextAlignCenter",
  "TextAlignJustify",
  "TextAlignLeft",
  "TextAlignRight",
  "TextB",
  "TextColumns",
  "TextH",
  "TextHFive",
  "TextHFour",
  "TextHOne",
  "TextHSix",
  "TextHThree",
  "TextHTwo",
  "TextIndent",
  "TextItalic",
  "TextOutdent",
  "TextStrikethrough",
  "TextSubscript",
  "TextSuperscript",
  "TextT",
  "TextTSlash",
  "TextUnderline",
  "Textbox",
  "Thermometer",
  "ThermometerCold",
  "ThermometerHot",
  "ThermometerSimple",
  "ThreadsLogo",
  "ThreeD",
  "ThumbsDown",
  "ThumbsUp",
  "Ticket",
  "TidalLogo",
  "TiktokLogo",
  "Tilde",
  "Timer",
  "TipJar",
  "Tipi",
  "Tire",
  "ToggleLeft",
  "ToggleRight",
  "Toilet",
  "ToiletPaper",
  "Toolbox",
  "Tooth",
  "Tornado",
  "Tote",
  "ToteSimple",
  "Towel",
  "Tractor",
  "Trademark",
  "TrademarkRegistered",
  "TrafficCone",
  "TrafficSign",
  "TrafficSignal",
  "Train",
  "TrainRegional",
  "TrainSimple",
  "Tram",
  "Translate",
  "Trash",
  "TrashSimple",
  "Tray",
  "TrayArrowDown",
  "TrayArrowUp",
  "TreasureChest",
  "Tree",
  "TreeEvergreen",
  "TreePalm",
  "TreeStructure",
  "TreeView",
  "TrendDown",
  "TrendUp",
  "Triangle",
  "TriangleDashed",
  "Trolley",
  "TrolleySuitcase",
  "Trophy",
  "Truck",
  "TruckTrailer",
  "TumblrLogo",
  "TwitchLogo",
  "TwitterLogo",
  "Umbrella",
  "UmbrellaSimple",
  "Union",
  "Unite",
  "UniteSquare",
  "Upload",
  "UploadSimple",
  "Usb",
  "User",
  "UserCheck",
  "UserCircle",
  "UserCircleCheck",
  "UserCircleDashed",
  "UserCircleGear",
  "UserCircleMinus",
  "UserCirclePlus",
  "UserFocus",
  "UserGear",
  "UserList",
  "UserMinus",
  "UserPlus",
  "UserRectangle",
  "UserSound",
  "UserSquare",
  "UserSwitch",
  "Users",
  "UsersFour",
  "UsersThree",
  "Van",
  "Vault",
  "VectorThree",
  "VectorTwo",
  "Vibrate",
  "Video",
  "VideoCamera",
  "VideoCameraSlash",
  "VideoConference",
  "Vignette",
  "VinylRecord",
  "VirtualReality",
  "Virus",
  "Visor",
  "Voicemail",
  "Volleyball",
  "Wall",
  "Wallet",
  "Warehouse",
  "Warning",
  "WarningCircle",
  "WarningDiamond",
  "WarningOctagon",
  "WashingMachine",
  "Watch",
  "WaveSawtooth",
  "WaveSine",
  "WaveSquare",
  "WaveTriangle",
  "Waveform",
  "WaveformSlash",
  "Waves",
  "Webcam",
  "WebcamSlash",
  "WebhooksLogo",
  "WechatLogo",
  "WhatsappLogo",
  "Wheelchair",
  "WheelchairMotion",
  "WifiHigh",
  "WifiLow",
  "WifiMedium",
  "WifiNone",
  "WifiSlash",
  "WifiX",
  "Wind",
  "Windmill",
  "WindowsLogo",
  "Wine",
  "Wrench",
  "X",
  "XCircle",
  "XLogo",
  "XSquare",
  "Yarn",
  "YinYang",
  "YoutubeLogo",
  "Zeppelin",
];

/** Names from ALL_ICON_NAMES that exist in @phosphor-icons/react (browser uses full set, not iconRegistry). */
const BROWSABLE_ICON_NAMES = filterBrowsableIconNames(ALL_ICON_NAMES);

// IconCard component for click-to-copy functionality
interface IconCardProps {
  name: string;
  onCopy: (name: string) => void;
}

const IconCard = ({ name, onCopy }: IconCardProps) => {
  const [showHint, setShowHint] = useState(false);
  const PhosphorComponent = resolveBrowserPhosphorIcon(name);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(name);
      onCopy(name);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      type="button"
      className={styles.iconCard}
      onClick={handleClick}
      onMouseEnter={() => setShowHint(true)}
      onMouseLeave={() => setShowHint(false)}
      aria-label={`Copy ${name} icon name`}
    >
      <div className={styles.iconDisplay}>
        {PhosphorComponent ? (
          <PhosphorComponent size={48} weight="regular" aria-hidden />
        ) : (
          <span aria-hidden>—</span>
        )}
      </div>
      <div className={styles.iconName}>{name}</div>
      {showHint && <div className={styles.copyHint}>Click to copy</div>}
    </button>
  );
};

// Documentation Component
const IconsDocsContent = () => {
  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Icons</h1>
        <p className={styles.lead}>
          Complete Phosphor Icons library with {ALL_ICON_NAMES.length} icons
          integrated via the Icon component.
        </p>
      </header>

      <section className={styles.section}>
        <h2>Overview</h2>
        <p>
          All icons are from{" "}
          <a
            href="https://phosphoricons.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Phosphor Icons
          </a>
          , a flexible icon family for interfaces, diagrams, presentations, and
          more. The Icon component provides a consistent API for rendering any
          Phosphor icon with customizable size, weight, and color.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Basic Usage</h2>
        <pre className={styles.code}>
          {`import Icon from '@dt/Icon';

function MyComponent() { return (
    <>
      <Icon name="Heart" size="md" />
      <Icon name="Star" size="lg" color="gold" />
      <Icon name="Check" size="sm" weight="bold" />
    </>
  );
}`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Props</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>name</code>
              </td>
              <td>
                <code>string</code>
              </td>
              <td>-</td>
              <td>Icon name (PascalCase or kebab-case)</td>
            </tr>
            <tr>
              <td>
                <code>size</code>
              </td>
              <td>
                <code>
                  "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | number
                </code>
              </td>
              <td>
                <code>"md"</code>
              </td>
              <td>Icon size preset or pixel value</td>
            </tr>
            <tr>
              <td>
                <code>weight</code>
              </td>
              <td>
                <code>
                  "thin" | "light" | "regular" | "bold" | "fill" | "duotone"
                </code>
              </td>
              <td>
                <code>"regular"</code>
              </td>
              <td>Icon weight/style</td>
            </tr>
            <tr>
              <td>
                <code>color</code>
              </td>
              <td>
                <code>string</code>
              </td>
              <td>
                <code>"currentColor"</code>
              </td>
              <td>Icon color (CSS color value)</td>
            </tr>
            <tr>
              <td>
                <code>decorative</code>
              </td>
              <td>
                <code>boolean</code>
              </td>
              <td>
                <code>false</code>
              </td>
              <td>
                If true, hides icon from screen readers (use when meaning is
                conveyed by adjacent text)
              </td>
            </tr>
            <tr>
              <td>
                <code>ariaLabel</code>
              </td>
              <td>
                <code>string</code>
              </td>
              <td>-</td>
              <td>
                Accessible label for screen readers (required if not decorative)
              </td>
            </tr>
            <tr>
              <td>
                <code>mirrored</code>
              </td>
              <td>
                <code>boolean</code>
              </td>
              <td>
                <code>false</code>
              </td>
              <td>Flip icon horizontally (for RTL support)</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>Size Options</h2>
        <p>
          The Icon component supports named size presets and custom pixel
          values:
        </p>
        <div className={styles.sizeDemo}>
          <div className={styles.sizeItem}>
            <Icon name="Heart" size="2xs" decorative />
            <span>2xs (12px)</span>
          </div>
          <div className={styles.sizeItem}>
            <Icon name="Heart" size="xs" decorative />
            <span>xs (14px)</span>
          </div>
          <div className={styles.sizeItem}>
            <Icon name="Heart" size="sm" decorative />
            <span>sm (16px)</span>
          </div>
          <div className={styles.sizeItem}>
            <Icon name="Heart" size="md" decorative />
            <span>md (20px)</span>
          </div>
          <div className={styles.sizeItem}>
            <Icon name="Heart" size="lg" decorative />
            <span>lg (24px)</span>
          </div>
          <div className={styles.sizeItem}>
            <Icon name="Heart" size="xl" decorative />
            <span>xl (32px)</span>
          </div>
          <div className={styles.sizeItem}>
            <Icon name="Heart" size="2xl" decorative />
            <span>2xl (48px)</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Weight Options</h2>
        <p>
          Phosphor icons support six distinct weights for visual hierarchy and
          emphasis:
        </p>
        <div className={styles.weightDemo}>
          <div className={styles.weightItem}>
            <Icon name="Heart" size="lg" weight="thin" decorative />
            <span>thin</span>
          </div>
          <div className={styles.weightItem}>
            <Icon name="Heart" size="lg" weight="light" decorative />
            <span>light</span>
          </div>
          <div className={styles.weightItem}>
            <Icon name="Heart" size="lg" weight="regular" decorative />
            <span>regular</span>
          </div>
          <div className={styles.weightItem}>
            <Icon name="Heart" size="lg" weight="bold" decorative />
            <span>bold</span>
          </div>
          <div className={styles.weightItem}>
            <Icon name="Heart" size="lg" weight="fill" decorative />
            <span>fill</span>
          </div>
          <div className={styles.weightItem}>
            <Icon name="Heart" size="lg" weight="duotone" decorative />
            <span>duotone</span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Accessibility</h2>
        <p>The Icon component follows accessibility best practices:</p>
        <ul>
          <li>
            <strong>Decorative icons</strong>: Set <code>decorative=true</code>{" "}
            when the icon's meaning is conveyed by adjacent text (e.g., button
            labels)
          </li>
          <li>
            <strong>Meaningful icons</strong>: Provide an <code>ariaLabel</code>{" "}
            when the icon stands alone or adds semantic meaning
          </li>
          <li>
            <strong>Color contrast</strong>: Ensure sufficient contrast ratios
            for text-like icons
          </li>
          <li>
            <strong>Interactive icons</strong>: Wrap in a button or link with
            proper labels
          </li>
        </ul>
        <pre className={styles.code}>
          {`// Decorative (adjacent text provides meaning)
<Button>
  <Icon name="Download" size="sm" decorative />
  Download File
</Button>

// Meaningful (icon conveys unique information)
<Icon 
  name="WarningCircle" 
  size="md" 
  ariaLabel="Warning: Action required"
/>`}
        </pre>
      </section>

      <section className={styles.section}>
        <h2>Browse Icons</h2>
        <p>
          Visit the <strong>Icon Browser</strong> story to search and explore
          all {ALL_ICON_NAMES.length} available icons. Click any icon to copy
          its name for easy reference.
        </p>
      </section>
    </article>
  );
};

// Icon Browser Component for searchable grid
const IconBrowserContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedIcon, setCopiedIcon] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return BROWSABLE_ICON_NAMES;
    }

    const query = searchQuery.toLowerCase();
    return BROWSABLE_ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  const handleCopy = (name: string) => {
    setCopiedIcon(name);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  return (
    <article className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Icon Browser</h1>
        <p className={styles.lead}>
          Search and browse {BROWSABLE_ICON_NAMES.length} Phosphor icons. Click
          any icon to copy its name to clipboard.
        </p>
      </header>

      <section className={styles.section}>
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <Icon
              name="MagnifyingGlass"
              size="sm"
              className={styles.searchIcon}
              decorative
            />
            <input
              type="text"
              placeholder="Search icons... (e.g., 'heart', 'arrow', 'user')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              aria-label="Search icons"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className={styles.clearButton}
                aria-label="Clear search"
                type="button"
              >
                <Icon name="X" size="xs" decorative />
              </button>
            )}
          </div>
          <div className={styles.resultCount}>
            {filteredIcons.length}{" "}
            {filteredIcons.length === 1 ? "icon" : "icons"}
          </div>
        </div>

        <div className={styles.iconGrid}>
          {filteredIcons.map((iconName) => (
            <IconCard key={iconName} name={iconName} onCopy={handleCopy} />
          ))}
        </div>

        {filteredIcons.length === 0 && (
          <div className={styles.emptyState}>
            <Icon name="MagnifyingGlass" size="2xl" decorative />
            <p>No icons found matching "{searchQuery}"</p>
            <button
              onClick={() => setSearchQuery("")}
              className={styles.resetButton}
              type="button"
            >
              Clear search
            </button>
          </div>
        )}
      </section>

      {showToast && copiedIcon && (
        <Toast
          message={`Copied "${copiedIcon}" to clipboard`}
          open={showToast}
          onClose={() => setShowToast(false)}
        />
      )}
    </article>
  );
};

const meta: Meta = {
  title: "Docs/Icons",
  parameters: {
    layout: "fullscreen",
    vitest: {
      skip: true, // Skip Vitest tests for this large documentation showcase (1952 lines, 1515 icons)
    },
  },
};

export default meta;

type Story = StoryObj;

export const Default: Story = { render: () => <IconsDocsContent /> };

export const Browse: Story = { render: () => <IconBrowserContent /> };
