import React, { useState } from "react";
import { 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Check,
  Shield,
  Key,
  Globe,
  Lock,
  Code,
  BookOpen,
  Zap,
  Database,
  Activity,
  Users,
  Gamepad2,
  Clock,
  AlertCircle,
  Server,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ShieldCheck,
  Wifi,
  Globe2,
  UserX,
  Play,
  Minus,
  Plus,
  Trophy
} from "lucide-react";
import Header from "../components/Layout/Header";
import { useTheme } from "../contexts/ThemeContext";
import { useSelector, useDispatch } from 'react-redux';


// JSON Viewer Component
const JSONViewer = ({ data }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

 

  const toggleNode = (path) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  const renderValue = (value, path = 'root', depth = 0) => {
    if (value === null) return <span className="text-gray-500">null</span>;
    if (value === undefined) return <span className="text-gray-500">undefined</span>;
    
    const type = typeof value;
    
    if (type === 'string') {
      return <span className="text-green-600 dark:text-green-400">"{value}"</span>;
    }
    if (type === 'number') {
      return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
    }
    if (type === 'boolean') {
      return <span className="text-purple-600 dark:text-purple-400">{value.toString()}</span>;
    }
    if (Array.isArray(value)) {
      const isExpanded = expandedNodes.has(path);
      const isEmpty = value.length === 0;
      
      return (
        <div className="font-mono">
          <div 
            className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1"
            onClick={() => toggleNode(path)}
          >
            {isEmpty ? (
              <span className="text-gray-400">[ ]</span>
            ) : (
              <>
                {isExpanded ? 
                  <ChevronDown size={14} className="text-gray-500" /> : 
                  <ChevronRight size={14} className="text-gray-500" />
                }
                <span className="text-gray-600 dark:text-gray-400">
                  Array({value.length})
                </span>
              </>
            )}
          </div>
          {isExpanded && !isEmpty && (
            <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
              {value.map((item, index) => (
                <div key={index} className="my-1">
                  <span className="text-gray-500 mr-2">{index}:</span>
                  {renderValue(item, `${path}[${index}]`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (type === 'object') {
      const isExpanded = expandedNodes.has(path);
      const isEmpty = Object.keys(value).length === 0;
      
      return (
        <div className="font-mono">
          <div 
            className="flex items-center gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1"
            onClick={() => toggleNode(path)}
          >
            {isEmpty ? (
              <span className="text-gray-400">{'{ }'}</span>
            ) : (
              <>
                {isExpanded ? 
                  <ChevronDown size={14} className="text-gray-500" /> : 
                  <ChevronRight size={14} className="text-gray-500" />
                }
                <span className="text-gray-600 dark:text-gray-400">
                  Object({Object.keys(value).length})
                </span>
              </>
            )}
          </div>
          {isExpanded && !isEmpty && (
            <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
              {Object.entries(value).map(([key, val]) => (
                <div key={key} className="my-1">
                  <span className="text-red-600 dark:text-red-400 mr-2">"{key}":</span>
                  {renderValue(val, `${path}.${key}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return <span>{String(value)}</span>;
  };

  return (
    <div className="font-mono text-sm">
      {renderValue(data)}
    </div>
  );
};

// API Configuration
const API_CONFIG = {
  baseUrl: "https://api-docs.space/api",
  resultbaseUrl: "https://api-docs.space/api",
  cricketKey: "P18eCa60SONhiAazrFHG",
  zilliKey: "P18eCa60SONhiAazrFHG",
  domain: "api-docs.space"
};

const API_STRUCTURE = {
  "Cricket API": {
    description: "Live cricket match data and betting information",
    icon: "🏏",
    basePath: "/api/cricket",
    auth: "cricketGameValidate",
    color: "emerald",
    endpoints: {
      "Match Data": [
        { 
          method: "GET", 
          name: "Get Cricket Matches", 
          path: "/cricket/game-data",
          description: "Fetch all live and upcoming cricket matches",
          auth: "cricketGameValidate",
          apiKey: API_CONFIG.cricketKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" }
          ]
        },
        { 
          method: "GET", 
          name: "Match Betting Data", 
          path: "/cricket-match/game-data",
          description: "Get detailed betting odds for a specific match",
          auth: "cricketGameValidate",
          apiKey: API_CONFIG.cricketKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" },
            { name: "gameid", type: "string", required: true, description: "Match ID (e.g., match_123)", location: "query" }
          ]
        }
      ],
      "Tennis": [
        { 
          method: "GET", 
          name: "Get Tennis Matches", 
          path: "/tannis/game-data",
          description: "Fetch all live and upcoming tennis matches",
          auth: "cricketGameValidate",
          apiKey: API_CONFIG.cricketKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" }
          ]
        },
        { 
          method: "GET", 
          name: "Tennis Betting Data", 
          path: "/tannis-match/game-data",
          description: "Get tennis match betting odds",
          auth: "cricketGameValidate",
          apiKey: API_CONFIG.cricketKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" },
            { name: "gameid", type: "string", required: true, description: "Match ID", location: "query" }
          ]
        }
      ],
      "Soccer": [
        { 
          method: "GET", 
          name: "Get Soccer Matches", 
          path: "/socer/game-data",
          description: "Fetch all live and upcoming soccer matches",
          auth: "cricketGameValidate",
          apiKey: API_CONFIG.cricketKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" }
          ]
        },
        { 
          method: "GET", 
          name: "Soccer Betting Data", 
          path: "/socer-match/game-data",
          description: "Get soccer match betting odds",
          auth: "cricketGameValidate",
          apiKey: API_CONFIG.cricketKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" },
            { name: "gameid", type: "string", required: true, description: "Match ID", location: "query" }
          ]
        }
      ]
    }
  },
  "Zilli API": {
    description: "Game provider integration for casino games",
    icon: "🎮",
    basePath: "/api",
    auth: "validateGameAccess / lunchGameValidate",
    color: "purple",
    endpoints: {
      "Game Management": [
        { 
          method: "GET", 
          name: "Get Game Details", 
          path: "/getgamedetails",
          description: "Fetch available games with optional filters",
          auth: "validateGameAccess",
          apiKey: API_CONFIG.zilliKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" },
            { name: "provider_list", type: "boolean", description: "Get provider list (1/0)", location: "query" },
            { name: "gametype_list", type: "boolean", description: "Get game types (1/0)", location: "query" },
            { name: "provider", type: "string", description: "Filter by provider", location: "query" },
            { name: "game_type", type: "string", description: "Filter by game type", location: "query" },
            { name: "page", type: "number", description: "Page number", location: "query" },
            { name: "size", type: "number", description: "Items per page (default: 20)", location: "query" }
          ]
        },
        { 
          method: "GET", 
          name: "Active Providers", 
          path: "/lunches-providers",
          description: "Get list of active game providers for your account",
          auth: "validateGameAccess",
          apiKey: API_CONFIG.zilliKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" },
            { name: "page", type: "number", description: "Page number", location: "query" },
            { name: "size", type: "number", description: "Items per page (default: 10)", location: "query" }
          ]
        }
      ],
      "Game Launch": [
        { 
          method: "POST", 
          name: "Launch Game", 
          path: "/launch-game",
          description: "Get game launch URL for seamless integration",
          auth: "lunchGameValidate",
          apiKey: API_CONFIG.zilliKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" }
          ],
          body: [
            { name: "uid", type: "string", required: true, description: "Game UID", location: "body" },
            { name: "playerid", type: "string", required: true, description: "Player ID (unique identifier for the player)", location: "body" },
            { name: "opening_balance", type: "number", required: true, description: "Initial balance to credit to player", location: "body" }
          ]
        }
      ],
      "Wallet Operations": [
        { 
          method: "POST", 
          name: "Get User Balance", 
          path: "/Userbalance",
          description: "Get current balance for a player",
          auth: "lunchGameValidate",
          apiKey: API_CONFIG.zilliKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" }
          ],
          body: [
            { name: "playerid", type: "string", required: true, description: "Player ID", location: "body" }
          ]
        },
        { 
          method: "POST", 
          name: "Set User Balance", 
          path: "/Setbalance",
          description: "Update player balance (credit/debit)",
          auth: "lunchGameValidate",
          apiKey: API_CONFIG.zilliKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" }
          ],
          body: [
            { name: "playerid", type: "string", required: true, description: "Player ID", location: "body" },
            { name: "opening_balance", type: "number", required: true, description: "Amount to add (positive) or subtract (negative)", location: "body" }
          ]
        }
      ],
      "History": [
        { 
          method: "POST", 
          name: "Bet History", 
          path: "/history",
          description: "Get betting history for players",
          auth: "lunchGameValidate",
          apiKey: API_CONFIG.zilliKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" }
          ],
          body: [
            { name: "playerid", type: "string", description: "Filter by player (optional)", location: "body" },
            { name: "page", type: "number", description: "Page number (default: 1)", location: "body" },
            { name: "limit", type: "number", description: "Items per page (default: 20, max: 100)", location: "body" },
            { name: "from_date", type: "string", description: "Start date (ISO format: YYYY-MM-DD)", location: "body" },
            { name: "to_date", type: "string", description: "End date (ISO format: YYYY-MM-DD)", location: "body" }
          ]
        }
      ]
    }
  },
  "Cricket Result": {
    description: "Cricket betting results and settlement",
    icon: "🏆",
    basePath: "/api",
    auth: "cricketGameValidate",
    color: "amber",
    endpoints: {
      "Final Result": [
        { 
          method: "POST", 
          name: "Place Bet", 
          path: "/placed_bets",
          description: "Create a new bet for final result settlement",
          auth: "cricketGameValidate",
          apiKey: API_CONFIG.cricketKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" }
          ],
          body: [
            { name: "gameId", type: "number", required: true, description: "Game/Match ID", location: "body" },
            { name: "event_id", type: "number", required: true, description: "Event ID (same as gameId)", location: "body" },
            { name: "event_name", type: "string", required: true, description: "Event/Match name", location: "body" },
            { name: "market_name", type: "string", required: true, description: "Market name (e.g., Match Winner)", location: "body" },
            { name: "gameName", type: "string", required: true, description: "Game name", location: "body" },
            { name: "market_id", type: "number", required: true, description: "Unique market identifier", location: "body" },
            { name: "market_type", type: "string", description: "Market type (optional)", location: "body" }
          ]
        },
        { 
          method: "POST", 
          name: "Get Result", 
          path: "/get-result",
          description: "Get final result for a bet",
          auth: "cricketGameValidate",
          apiKey: API_CONFIG.cricketKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" }
          ],
          body: [
            { name: "gameId", type: "number", required: true, description: "Game/Match ID", location: "body" },
            { name: "event_name", type: "string", required: true, description: "Event/Match name", location: "body" },
            { name: "market_id", type: "number", required: true, description: "Market identifier", location: "body" },
            { name: "market_name", type: "string", required: true, description: "Market name", location: "body" }
          ]
        }
      ],
      "Fancy Bet Result": [
        { 
          method: "POST", 
          name: "Place Fancy Bet", 
          path: "/placed_fancy_bets",
          description: "Create a new fancy bet for result settlement",
          auth: "cricketGameValidate",
          apiKey: API_CONFIG.cricketKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" }
          ],
          body: [
            { name: "gameId", type: "number", required: true, description: "Game/Match ID", location: "body" },
            { name: "event_id", type: "number", required: true, description: "Event ID (same as gameId)", location: "body" },
            { name: "event_name", type: "string", required: true, description: "Event/Match name", location: "body" },
            { name: "market_name", type: "string", required: true, description: "Market name", location: "body" },
            { name: "market_id", type: "number", required: true, description: "Unique market identifier", location: "body" },
            { name: "market_type", type: "string", description: "Market type (optional)", location: "body" }
          ]
        },
        { 
          method: "POST", 
          name: "Get Fancy Result", 
          path: "/get-fancy-result",
          description: "Get fancy result for a bet",
          auth: "cricketGameValidate",
          apiKey: API_CONFIG.cricketKey,
          params: [
            { name: "key", type: "string", required: true, description: "Your API key", location: "query" }
          ],
          body: [
            { name: "gameId", type: "number", required: true, description: "Game/Match ID", location: "body" },
            { name: "event_name", type: "string", required: true, description: "Event/Match name", location: "body" },
            { name: "market_id", type: "number", required: true, description: "Market identifier", location: "body" },
            { name: "market_name", type: "string", required: true, description: "Market name", location: "body" }
          ]
        }
      ]
    }
  }
};

// Middleware Documentation
const MIDDLEWARE_DOCS = {
  "validateGameAccess": {
    name: "Game Access Validation",
    description: "Validates access for game provider endpoints",
    icon: ShieldCheck,
    color: "blue",
    required: {
      query: [
        { name: "key", type: "string", required: true, description: "API Key for authentication" }
      ],
      headers: [
        { name: "x-domain", type: "string", required: true, description: "Your registered domain name" }
      ],
      ip: {
        required: true,
        description: "IP address must be whitelisted in your account"
      }
    },
    validationSteps: [
      { step: "API Key Validation", icon: Key, description: "Checks if key is provided and valid" },
      { step: "User Status", icon: Users, description: "Verifies user account is active" },
      { step: "IP Whitelist", icon: Shield, description: "Validates request IP against whitelist" },
      { step: "Domain Check", icon: Globe, description: "Ensures x-domain header matches registered domain" },
      { step: "Provider Access", icon: Gamepad2, description: "Verifies user has access to requested providers" }
    ],
    errorResponses: [
      { code: 400, message: "Key is required", icon: AlertCircle },
      { code: 401, message: "Invalid key", icon: UserX },
      { code: 403, message: "User is D-Activate", icon: UserX },
      { code: 403, message: "Domain not configured / Access denied", icon: Globe2 },
      { code: 403, message: "IP not whitelisted", icon: Wifi },
      { code: 403, message: "No provider access found", icon: Gamepad2 }
    ]
  },
  "lunchGameValidate": {
    name: "Game Launch Validation",
    description: "Validates requests for game launch and wallet operations",
    icon: Zap,
    color: "amber",
    required: {
      query: [
        { name: "key", type: "string", required: true, description: "API Key for authentication" }
      ],
      headers: [
        { name: "x-domain", type: "string", required: true, description: "Your registered domain name" }
      ],
      ip: {
        required: true,
        description: "IP address must be whitelisted in your account"
      }
    },
    validationSteps: [
      { step: "API Key Validation", icon: Key, description: "Checks if key is provided and valid" },
      { step: "User Status", icon: Users, description: "Verifies user account is active" },
      { step: "Domain Check", icon: Globe, description: "Ensures x-domain header matches registered domain" },
      { step: "IP Whitelist", icon: Shield, description: "Validates request IP against whitelist" }
    ],
    errorResponses: [
      { code: 400, message: "Key is required", icon: AlertCircle },
      { code: 401, message: "Invalid key", icon: UserX },
      { code: 403, message: "User is not active", icon: UserX },
      { code: 403, message: "Domain not configured / Access denied", icon: Globe2 },
      { code: 403, message: "IP not whitelisted", icon: Wifi }
    ]
  },
  "cricketGameValidate": {
    name: "Cricket Game Validation",
    description: "Validates access for cricket-specific endpoints including result APIs",
    icon: Gamepad2,
    color: "emerald",
    required: {
      query: [
        { name: "key", type: "string", required: true, description: "API Key for authentication" }
      ],
      headers: [
        { name: "x-domain", type: "string", required: true, description: "Your registered domain name" }
      ],
      ip: {
        required: true,
        description: "IP address must be whitelisted in your account"
      }
    },
    validationSteps: [
      { step: "API Key Validation", icon: Key, description: "Checks if key is provided and valid" },
      { step: "User Status", icon: Users, description: "Verifies user account is active" },
      { step: "Balance Check", icon: CreditCard, description: "Ensures cricket balance > 0" },
      { step: "Domain Check", icon: Globe, description: "Ensures x-domain header matches registered domain" },
      { step: "IP Whitelist", icon: Shield, description: "Validates request IP against whitelist" }
    ],
    errorResponses: [
      { code: 400, message: "Key is required", icon: AlertCircle },
      { code: 401, message: "Invalid key", icon: UserX },
      { code: 403, message: "User is not active", icon: UserX },
      { code: 403, message: "Your plane experi", icon: CreditCard },
      { code: 403, message: "Domain not configured / Access denied", icon: Globe2 },
      { code: 403, message: "IP not whitelisted", icon: Wifi }
    ]
  }
};

const codeExamples = {
  "GET": {
    "javascript": (path, apiKey, isResultEndpoint) => `// Using Axios
const axios = require('axios');
const baseUrl = ${isResultEndpoint ? '"https://api-docs.space/api"' : '"https://api-docs.space/api"'};

axios.get(baseUrl + "${path}?key=${apiKey}", {
  headers: {
    "Content-Type": "application/json",
    "x-domain": "api-docs.space"
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));`,

    "python": (path, apiKey, isResultEndpoint) => `import requests

base_url = ${isResultEndpoint ? '"https://api-docs.space/api"' : '"https://api-docs.space/api"'}
url = base_url + "${path}"
params = {"key": "${apiKey}"}
headers = {"x-domain": "api-docs.space"}

response = requests.get(url, params=params, headers=headers)
data = response.json()
print(data)`,

    "php": (path, apiKey, isResultEndpoint) => `<?php
$baseUrl = ${isResultEndpoint ? '"https://api-docs.space/api"' : '"https://api-docs.space/api"'};
$client = new GuzzleHttp\\Client();

try {
    $response = $client->request('GET', $baseUrl . '${path}', [
        'query' => ['key' => '${apiKey}'],
        'headers' => [
            'Content-Type' => 'application/json',
            'x-domain' => 'api-docs.space'
        ]
    ]);
    
    $data = json_decode($response->getBody(), true);
    print_r($data);
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
?>`,
    
    "curl": (path, apiKey, isResultEndpoint) => `curl -X GET "${isResultEndpoint ? 'https://api-docs.space/api' : 'https://api-docs.space/api'}${path}?key=${apiKey}" \\
  -H "x-domain: api-docs.space"`
  },
  "POST": {
    "javascript": (path, apiKey, bodyExample, isResultEndpoint) => `// Using Axios
const axios = require('axios');
const baseUrl = ${isResultEndpoint ? '"https://api-docs.space/api"' : '"https://api-docs.space/api"'};

axios.post(baseUrl + "${path}?key=${apiKey}", ${JSON.stringify(bodyExample, null, 2)}, {
  headers: {
    "Content-Type": "application/json",
    "x-domain": "api-docs.space"
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));`,

    "python": (path, apiKey, bodyExample, isResultEndpoint) => `import requests
import json
import { useSelector } from 'react-redux';

base_url = ${isResultEndpoint ? '"https://api-docs.space/api"' : '"https://api-docs.space/api"'}
url = base_url + "${path}"
params = {"key": "${apiKey}"}
headers = {"x-domain": "api-docs.space"}
payload = ${JSON.stringify(bodyExample, null, 2)}

response = requests.post(url, params=params, json=payload, headers=headers)
data = response.json()
print(data)`,

    "php": (path, apiKey, bodyExample, isResultEndpoint) => `<?php
$baseUrl = ${isResultEndpoint ? '"https://api-docs.space/api"' : '"https://api-docs.space/api"'};
$client = new GuzzleHttp\\Client();

$payload = ${JSON.stringify(bodyExample, null, 2)};

try {
    $response = $client->request('POST', $baseUrl . '${path}', [
        'query' => ['key' => '${apiKey}'],
        'headers' => [
            'Content-Type' => 'application/json',
            'x-domain' => 'api-docs.space'
        ],
        'json' => $payload
    ]);
    
    $data = json_decode($response->getBody(), true);
    print_r($data);
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
?>`,
    
    "curl": (path, apiKey, bodyExample, isResultEndpoint) => `curl -X POST "${isResultEndpoint ? 'https://api-docs.space/api' : 'https://api-docs.space/api'}${path}?key=${apiKey}" \\
  -H "x-domain: api-docs.space" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(bodyExample)}'`
  }
};

const authFlowDiagram = [
  { step: "1. API Key", icon: Key, description: "Validate API key from query params" },
  { step: "2. User Status", icon: Users, description: "Check if user is active" },
  { step: "3. IP Whitelist", icon: Shield, description: "Verify request IP matches whitelist" },
  { step: "4. Domain Check", icon: Globe, description: "Validate x-domain header matches user domain" },
  { step: "5. Balance Check", icon: Database, description: "Verify sufficient balance (if applicable)" }
];

export default function ApiDocsUI() {
  const { theme } = useTheme();
  const [openMain, setOpenMain] = useState("Cricket API");
  const [openSub, setOpenSub] = useState("Match Data");
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [selectedMiddleware, setSelectedMiddleware] = useState(null);
  const [activeTab, setActiveTab] = useState("docs");
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [showAuthFlow, setShowAuthFlow] = useState(false);
  const [showMiddlewareDetails, setShowMiddlewareDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [responseError, setResponseError] = useState(null);
  const [testParams, setTestParams] = useState({});

  const currentAPI = API_STRUCTURE[openMain];
 const { user } = useSelector((state) => state.auth);
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

 

  const handleTestEndpoint = async () => {
  if (!selectedEndpoint) return;
  setActiveTab("response");
  
  setLoading(true);
  setResponseData(null);
  setResponseError(null);
  
  try {
    // Determine which base URL to use
    let baseUrl = API_CONFIG.baseUrl;
    
    // Check if this is a result/bet endpoint (Cricket Result tab)
    if (openMain === "Cricket Result") {
      baseUrl = API_CONFIG.resultbaseUrl;
    }
    
    const url = new URL(`${baseUrl}${selectedEndpoint.path}`);
    url.searchParams.append('key', selectedEndpoint.apiKey);
    
    // Add test params from query
    if (selectedEndpoint.params) {
      selectedEndpoint.params.forEach(param => {
        if (param.name !== 'key' && testParams[param.name]) {
          url.searchParams.append(param.name, testParams[param.name]);
        }
      });
    }
    
    const options = {
      method: selectedEndpoint.method,
      headers: {
        'Content-Type': 'application/json',
        'x-domain': API_CONFIG.domain
      }
    };
    
    // Add body for POST requests
    if (selectedEndpoint.method === 'POST' && selectedEndpoint.body) {
      const bodyData = {};
      selectedEndpoint.body.forEach(param => {
        if (testParams[param.name]) {
          if (param.type === 'number') {
            bodyData[param.name] = Number(testParams[param.name]);
          } else if (param.type === 'boolean') {
            bodyData[param.name] = testParams[param.name] === 'true';
          } else {
            bodyData[param.name] = testParams[param.name];
          }
        } else {
          // Provide default values for testing
          if (param.name === 'gameId' || param.name === 'event_id' || param.name === 'market_id') {
            bodyData[param.name] = 12345678;
          } else if (param.name === 'event_name') {
            bodyData[param.name] = 'India vs Australia';
          } else if (param.name === 'market_name') {
            bodyData[param.name] = 'Match Winner';
          } else if (param.name === 'gameName') {
            bodyData[param.name] = 'Cricket';
          } else if (param.type === 'number') {
            bodyData[param.name] = 100;
          } else if (param.type === 'boolean') {
            bodyData[param.name] = true;
          } else {
            bodyData[param.name] = "test_value";
          }
        }
      });
      options.body = JSON.stringify(bodyData);
    }
    
    const response = await fetch(url.toString(), options);
    const data = await response.json();
    
    if (response.ok) {
      setResponseData(data);
      setActiveTab("response");
    } else {
      setResponseError(data);
      setActiveTab("response");
    }
  } catch (error) {
    setResponseError({ error: error.message, status: false });
  } finally {
    setLoading(false);
  }
};


  const handleParamChange = (paramName, value) => {
    setTestParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  // Theme-based classes
  const themeClasses = {
    dark: {
      bg: 'bg-gray-900',
      bgSecondary: 'bg-gray-800',
      bgTertiary: 'bg-gray-850',
      text: 'text-white',
      textSecondary: 'text-gray-300',
      textMuted: 'text-gray-400',
      border: 'border-gray-700',
      sidebar: 'bg-gray-800/90 backdrop-blur-sm border-gray-700',
      card: 'bg-gray-800 border-gray-700',
      cardHover: 'hover:bg-gray-750',
      codeBg: 'bg-gray-950',
      codeText: 'text-green-400',
      gradient: 'from-blue-600 to-indigo-600',
      gradientSecondary: 'from-purple-600 to-pink-600',
      shadow: 'shadow-lg shadow-black/20'
    },
    light: {
      bg: 'bg-slate-50',
      bgSecondary: 'bg-white',
      bgTertiary: 'bg-gray-50',
      text: 'text-gray-800',
      textSecondary: 'text-gray-600',
      textMuted: 'text-slate-500',
      border: 'border-slate-200',
      sidebar: 'bg-white/80 backdrop-blur-sm border-slate-200',
      card: 'bg-white border-slate-200',
      cardHover: 'hover:bg-gray-50',
      codeBg: 'bg-slate-900',
      codeText: 'text-green-400',
      gradient: 'from-blue-600 to-indigo-600',
      gradientSecondary: 'from-purple-600 to-pink-600',
      shadow: 'shadow-lg shadow-gray-200/50'
    }
  };
const copyDocs = () => {
  const domain = window.location.host;

  const text = `
Doc Link: https://api-docs.space
Domain: ${domain}
API Key: ${user.key}
`;

  navigator.clipboard.writeText(text);
  alert("Copied successfully!");
};
  const classes = themeClasses[theme];

  const getMethodColor = (method) => {
    switch(method) {
      case 'GET': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'POST': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PUT': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'DELETE': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  const getLocationBadge = (location) => {
    switch(location) {
      case 'query': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'body': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'header': return 'bg-amber-100 text-amber-600 border-amber-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <Header />
      <div className={`flex h-screen ${classes.bg} mt-20`}>
        {/* Sidebar */}
        <aside className={`w-80 ${classes.sidebar} border-r ${classes.border} overflow-y-auto shadow-xl`}>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className={`w-10 h-10 bg-gradient-to-br ${classes.gradient} rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform`}>
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold bg-gradient-to-r ${classes.gradient} bg-clip-text text-transparent`}>
                  Zapcore API
                </h1>
                <p className={`text-xs ${classes.textMuted}`}>v1.0.0</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mb-6 space-y-2">
              <button 
                onClick={() => setShowAuthFlow(!showAuthFlow)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                  ${theme === 'dark' 
                    ? 'bg-indigo-900/30 hover:bg-indigo-900/50 border-indigo-800' 
                    : 'bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-indigo-100'
                  } transition-all border group`}
              >
                <Shield className={`w-5 h-5 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'} group-hover:scale-110 transition-transform`} />
                <span className={`font-medium text-sm ${classes.text}`}>Authentication Flow</span>
                <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showAuthFlow ? 'rotate-180' : ''} ${classes.textMuted}`} />
              </button>
              
              {showAuthFlow && (
                <div className={`mt-3 p-4 ${classes.bgSecondary} rounded-xl border ${classes.border} animate-slideDown`}>
                  {authFlowDiagram.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 mb-3 last:mb-0 group">
                      <div className={`w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-indigo-900/50' : 'bg-indigo-100'} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <item.icon className={`w-3 h-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
                      </div>
                      <div>
                        <p className={`text-xs font-medium ${classes.text}`}>{item.step}</p>
                        <p className={`text-xs ${classes.textMuted}`}>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Middleware Section */}
            <div className="mb-6">
              <h3 className={`text-xs font-semibold uppercase ${classes.textMuted} mb-2 px-2`}>Middleware</h3>
              {Object.entries(MIDDLEWARE_DOCS).map(([key, middleware]) => {
                const Icon = middleware.icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedMiddleware(middleware);
                      setSelectedEndpoint(null);
                      setShowMiddlewareDetails(key);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all ${
                      showMiddlewareDetails === key
                        ? `bg-gradient-to-r from-${middleware.color}-600 to-${middleware.color}-700 text-white shadow-lg`
                        : `${classes.hover} ${classes.text}`
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      showMiddlewareDetails === key
                        ? 'bg-white/20'
                        : theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
                    }`}>
                      <Icon size={16} className={showMiddlewareDetails === key ? 'text-white' : `text-${middleware.color}-600`} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{middleware.name}</p>
                      <p className={`text-xs ${showMiddlewareDetails === key ? 'text-white/80' : classes.textMuted}`}>
                        {middleware.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* API Categories */}
            <div>
              <h3 className={`text-xs font-semibold uppercase ${classes.textMuted} mb-2 px-2`}>APIs</h3>
              {Object.entries(API_STRUCTURE).map(([main, data]) => (
                <div key={main} className="mb-3">
                  <button
                    onClick={() => {
                      setOpenMain(main);
                      setSelectedEndpoint(null);
                      setSelectedMiddleware(null);
                      setShowMiddlewareDetails(null);
                      setOpenSub(Object.keys(data.endpoints)[0]);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      openMain === main && !showMiddlewareDetails
                        ? `bg-gradient-to-r ${classes.gradient} text-white shadow-lg` 
                        : `${classes.hover} ${classes.text}`
                    }`}
                  >
                    <span className="text-xl">{data.icon}</span>
                    <span className="font-medium flex-1 text-left">{main}</span>
                    {openMain === main ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>

                  {openMain === main && !showMiddlewareDetails && (
                    <div className="ml-4 mt-2 space-y-1 animate-slideDown">
                      {Object.keys(data.endpoints).map((sub) => (
                        <div key={sub}>
                          <button
                            onClick={() => {
                              setOpenSub(sub);
                              setSelectedEndpoint(null);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm ${
                              openSub === sub 
                                ? theme === 'dark' ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-50 text-blue-700'
                                : `${classes.textSecondary} ${classes.hover}`
                            }`}
                          >
                            <span>{sub}</span>
                            {openSub === sub ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>

                          {openSub === sub && (
                            <div className="ml-4 mt-1 space-y-1">
                              {data.endpoints[sub].map((ep, i) => (
                                <button
                                  key={i}
                                  onClick={() => {
                                    setSelectedEndpoint(ep);
                                    setSelectedMiddleware(null);
                                    setShowMiddlewareDetails(null);
                                    setTestParams({});
                                    setResponseData(null);
                                    setResponseError(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 rounded-lg text-xs transition-all ${
                                    selectedEndpoint?.name === ep.name
                                      ? theme === 'dark' ? 'bg-blue-900/30 text-blue-300 font-medium' : 'bg-blue-100 text-blue-700 font-medium'
                                      : `${classes.textSecondary} ${classes.hover}`
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${getMethodColor(ep.method)}`}>
                                      {ep.method}
                                    </span>
                                    <span className="truncate">{ep.name}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Base URL Info */}
           {/* Base URL Info - Updated to show both URLs */}
            <div className={`mt-8 p-4 ${classes.bgSecondary} rounded-xl border ${classes.border}`}>
              <p className={`text-xs ${classes.textMuted} mb-2 flex items-center gap-1`}>
                <Server size={12} />
                BASE URLs
              </p>
              <div className="space-y-2">
                <div className={`flex items-center gap-2 ${classes.card} p-2 rounded-lg border ${classes.border} group hover:border-blue-500 transition-colors`}>
                  <code className={`text-xs flex-1 ${classes.text} font-mono`}>Main API: {API_CONFIG.baseUrl}</code>
                  <button 
                    onClick={() => handleCopy(API_CONFIG.baseUrl)}
                    className={`p-1 ${classes.hover} rounded transition-all hover:scale-110`}
                  >
                    {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className={classes.textMuted} />}
                  </button>
                </div>
              
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto ${classes.bg}`}>
          {!selectedEndpoint && !showMiddlewareDetails ? (
            <div className="h-full flex items-center justify-center p-8">
              <div className="max-w-4xl text-center animate-fadeIn">
                <div className={`w-28 h-28 bg-gradient-to-br ${classes.gradient} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl transform hover:scale-110 transition-transform`}>
                  <Zap className="w-14 h-14 text-white" />
                </div>
                <h2 className={`text-5xl font-bold mb-4 bg-gradient-to-r ${classes.gradient} bg-clip-text text-transparent`}>
                  Zapcore API Documentation
                </h2>
                <p className={`${classes.textSecondary} mb-8 text-lg max-w-2xl mx-auto`}>
                  Integrate cricket, tennis, soccer data, casino games, and betting results with our powerful API. 
                  Secure, fast, and reliable.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  {[
                    { icon: Shield, label: "IP Whitelist", desc: "Secure access control with IP validation", gradient: "from-blue-500 to-cyan-500" },
                    { icon: Zap, label: "Fast Integration", desc: "Quick setup with comprehensive docs", gradient: "from-amber-500 to-orange-500" },
                    { icon: Trophy, label: "Bet Settlement", desc: "Real-time result and fancy bet settlement", gradient: "from-yellow-500 to-amber-500" }
                  ].map((item, i) => (
                    <div key={i} className={`p-6 ${classes.card} rounded-2xl shadow-sm border ${classes.border} transform hover:scale-105 transition-all duration-300 group`}>
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className={`font-semibold text-base ${classes.text} mb-1`}>{item.label}</p>
                      <p className={`text-sm ${classes.textMuted}`}>{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-12 flex justify-center gap-4">
                  <div className={`px-4 py-2 ${classes.bgSecondary} rounded-full border ${classes.border} flex items-center gap-2`}>
                    <CheckCircle size={16} className="text-green-500" />
                    <span className={`text-sm ${classes.text}`}>99.9% Uptime</span>
                  </div>
                  <div className={`px-4 py-2 ${classes.bgSecondary} rounded-full border ${classes.border} flex items-center gap-2`}>
                    <ShieldCheck size={16} className="text-blue-500" />
                    <span className={`text-sm ${classes.text}`}>Enterprise Security</span>
                  </div>
                  <div className={`px-4 py-2 ${classes.bgSecondary} rounded-full border ${classes.border} flex items-center gap-2`}>
                    <Zap size={16} className="text-amber-500" />
                    <span className={`text-sm ${classes.text}`}>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>
          ) : showMiddlewareDetails ? (
            // Middleware Detail View
            <div className="p-8 animate-fadeIn">
              <div className={`${classes.card} rounded-2xl p-8 shadow-sm border ${classes.border} mb-6`}>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br from-${MIDDLEWARE_DOCS[showMiddlewareDetails].color}-600 to-${MIDDLEWARE_DOCS[showMiddlewareDetails].color}-700 rounded-2xl flex items-center justify-center shadow-lg`}>
                    {React.createElement(MIDDLEWARE_DOCS[showMiddlewareDetails].icon, { size: 32, className: "text-white" })}
                  </div>
                  <div>
                    <h1 className={`text-3xl font-bold ${classes.text} mb-2`}>{MIDDLEWARE_DOCS[showMiddlewareDetails].name}</h1>
                    <p className={classes.textSecondary}>{MIDDLEWARE_DOCS[showMiddlewareDetails].description}</p>
                  </div>
                </div>

                {/* Required Parameters */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Query Parameters */}
                  <div className={`${classes.bgSecondary} rounded-xl p-6 border ${classes.border}`}>
                    <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text}`}>
                      <Key size={18} className="text-blue-500" />
                      Query Parameters
                    </h3>
                    <div className="space-y-3">
                      {MIDDLEWARE_DOCS[showMiddlewareDetails].required.query.map((param, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`px-2 py-1 rounded ${getLocationBadge('query')} text-xs font-mono`}>
                            {param.name}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium ${classes.text}`}>{param.type}</span>
                              {param.required && (
                                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">required</span>
                              )}
                            </div>
                            <p className={`text-xs ${classes.textMuted}`}>{param.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Headers */}
                  <div className={`${classes.bgSecondary} rounded-xl p-6 border ${classes.border}`}>
                    <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text}`}>
                      <Globe size={18} className="text-purple-500" />
                      Headers
                    </h3>
                    <div className="space-y-3">
                      {MIDDLEWARE_DOCS[showMiddlewareDetails].required.headers.map((header, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`px-2 py-1 rounded ${getLocationBadge('header')} text-xs font-mono`}>
                            {header.name}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-medium ${classes.text}`}>{header.type}</span>
                              {header.required && (
                                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">required</span>
                              )}
                            </div>
                            <p className={`text-xs ${classes.textMuted}`}>{header.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* IP Requirement */}
                <div className={`mb-8 p-4 ${classes.bgSecondary} rounded-xl border ${classes.border}`}>
                  <h3 className={`font-semibold mb-3 flex items-center gap-2 ${classes.text}`}>
                    <Wifi size={18} className="text-green-500" />
                    IP Whitelist Requirement
                  </h3>
                  <div className="flex items-start gap-3">
                    <div className={`px-2 py-1 rounded ${getLocationBadge('header')} text-xs font-mono`}>
                      x-forwarded-for / remoteAddress
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${classes.text}`}>string</span>
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">required</span>
                      </div>
                      <p className={`text-xs ${classes.textMuted}`}>{MIDDLEWARE_DOCS[showMiddlewareDetails].required.ip.description}</p>
                    </div>
                  </div>
                </div>

                {/* Validation Steps */}
                <div className="mb-8">
                  <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text}`}>
                    <ShieldCheck size={18} className="text-green-500" />
                    Validation Flow
                  </h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
                    {MIDDLEWARE_DOCS[showMiddlewareDetails].validationSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-4 mb-4 relative">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-${MIDDLEWARE_DOCS[showMiddlewareDetails].color}-600 to-${MIDDLEWARE_DOCS[showMiddlewareDetails].color}-700 flex items-center justify-center z-10 shadow-lg`}>
                          {React.createElement(step.icon, { size: 16, className: "text-white" })}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${classes.text}`}>{step.step}</p>
                          <p className={`text-sm ${classes.textMuted}`}>{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error Responses */}
                <div>
                  <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text}`}>
                    <AlertTriangle size={18} className="text-amber-500" />
                    Error Responses
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {MIDDLEWARE_DOCS[showMiddlewareDetails].errorResponses.map((error, idx) => (
                      <div key={idx} className={`p-3 ${classes.bgSecondary} rounded-lg border ${classes.border} flex items-start gap-3`}>
                        <div className={`p-1.5 rounded-full ${
                          error.code === 400 ? 'bg-amber-100' :
                          error.code === 401 ? 'bg-red-100' :
                          error.code === 403 ? 'bg-orange-100' :
                          'bg-gray-100'
                        }`}>
                          {React.createElement(error.icon, { size: 14, className: 
                            error.code === 400 ? 'text-amber-600' :
                            error.code === 401 ? 'text-red-600' :
                            error.code === 403 ? 'text-orange-600' :
                            'text-gray-600'
                          })}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                              error.code === 400 ? 'bg-amber-100 text-amber-700' :
                              error.code === 401 ? 'bg-red-100 text-red-700' :
                              error.code === 403 ? 'bg-orange-100 text-orange-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {error.code}
                            </span>
                          </div>
                          <p className={`text-xs ${classes.text}`}>{error.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Endpoint Detail View
            selectedEndpoint && (
              <div className="p-8 animate-fadeIn">
                {/* Endpoint Header */}
                <div className={`${classes.card} rounded-2xl p-6 shadow-sm border ${classes.border} mb-6 transform hover:scale-[1.02] transition-all duration-300`}>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-3 py-1.5 rounded-lg text-sm font-mono ${getMethodColor(selectedEndpoint.method)}`}>
                        {selectedEndpoint.method}
                      </span>
                      <code className={`text-lg font-mono ${classes.bgSecondary} px-3 py-1.5 rounded-lg ${classes.text} border ${classes.border}`}>
                        {selectedEndpoint.path}
                      </code>
                      {selectedEndpoint.auth && (
                        <span className={`px-2 py-1 rounded-lg text-xs bg-purple-100 text-purple-700 border border-purple-200`}>
                          {selectedEndpoint.auth}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                   
                <button 
                  onClick={() => {
                    const baseUrl = openMain === "Cricket Result" ? API_CONFIG.resultbaseUrl : API_CONFIG.baseUrl;
                    handleCopy(`${baseUrl}${selectedEndpoint.path}`);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 ${classes.bgSecondary} ${classes.hover} rounded-lg transition-all hover:scale-105 active:scale-95 border ${classes.border}`}
                >
                  Copy URL
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className={classes.textMuted} />}
                </button>
                    </div>
                  </div>
                  
                  <p className={`${classes.textSecondary} text-base mb-4`}>{selectedEndpoint.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className={`w-4 h-4 ${classes.textMuted}`} />
                      <span className={classes.textMuted}>Auth:</span>
                      <code className={`${classes.bgSecondary} px-2 py-1 rounded text-xs font-mono ${classes.text} border ${classes.border}`}>
                        {selectedEndpoint.auth}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Key className={`w-4 h-4 ${classes.textMuted}`} />
                      <span className={classes.textMuted}>Key:</span>
                      <code className={`${classes.bgSecondary} px-2 py-1 rounded text-xs font-mono ${classes.text} border ${classes.border}`}>
                        {selectedEndpoint.apiKey}
                      </code>
                    </div>
                  </div>
                </div>

                <div className=" flex justify-between">

                {/* Tabs */}
                <div className={`flex gap-1 mb-6 ${classes.bgSecondary} p-1 rounded-xl shadow-sm border ${classes.border} w-fit overflow-x-auto`}>
                  {[
                    { id: "docs", label: "Documentation", icon: BookOpen },
                    { id: "params", label: selectedEndpoint.method === 'POST' ? "Body" : "Parameters", icon: Code },
                    { id: "auth", label: "Authentication", icon: Lock },
                    { id: "response", label: "Response", icon: Activity }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r ${classes.gradient} text-white shadow-md`
                          : `${classes.textSecondary} ${classes.hover}`
                      }`}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  ))}
                </div>

              <div>
                   <button
                        onClick={handleTestEndpoint}
                        disabled={loading}
                        className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm ${
                          loading ? 'opacity-50 cursor-not-allowed' : ''
                        } bg-gradient-to-r ${classes.gradient} text-white hover:shadow-lg transition-all`}
                      >
                        <Play size={14} />
                        {loading ? 'Testing...' : 'Test Endpoint'}
                      </button>
              </div>
                </div>


                {/* Content Area */}
                <div className="grid grid-cols-12 gap-6">
                  {/* Left Panel - Code Examples */}
                  <div className="space-y-6 col-span-12 lg:col-span-5">
                    {/* Language Selector */}
                    <div className={`${classes.card} rounded-2xl p-4 shadow-sm border ${classes.border}`}>
                      {/* Language Selector */}

                      <div className={`flex gap-1 ${classes.bgSecondary} p-1 rounded-lg border ${classes.border}`}>
                        {["javascript", "python", "php", "curl"].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setSelectedLanguage(lang)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                              selectedLanguage === lang
                                ? `${classes.card} shadow-sm text-blue-600 border ${classes.border}`
                                : `${classes.textSecondary} ${classes.hover}`
                            }`}
                          >
                            {lang === 'javascript' ? 'Node.js' : 
                             lang === 'python' ? 'Python' : 
                             lang === 'php' ? 'PHP' : 'cURL'}
                          </button>
                        ))}
                      </div>
                      
                      <div className={`${classes.codeBg} rounded-xl border ${classes.border} overflow-hidden my-5`}>
                        <div className="flex items-center gap-2 px-4 py-2 bg-black/20 border-b border-gray-700">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className={`text-xs ${classes.textMuted} ml-2`}>example.{selectedLanguage === 'javascript' ? 'js' : selectedLanguage === 'python' ? 'py' : selectedLanguage === 'php' ? 'php' : 'sh'}</span>
                        </div>
                      <pre className="text-green-400 p-4 text-xs overflow-x-auto font-mono">
                        {(() => {
                          const template = codeExamples[selectedEndpoint.method]?.[selectedLanguage];
                          if (!template) return '';
                          
                          const isResultEndpoint = openMain === "Cricket Result";
                          
                          if (selectedEndpoint.method === 'POST' && selectedEndpoint.body) {
                            const bodyExample = {};
                            selectedEndpoint.body.forEach(param => {
                              if (param.type === 'number') bodyExample[param.name] = 12345678;
                              else if (param.type === 'boolean') bodyExample[param.name] = true;
                              else if (param.name === 'event_name') bodyExample[param.name] = "India vs Australia";
                              else if (param.name === 'market_name') bodyExample[param.name] = "Match Winner";
                              else if (param.name === 'gameName') bodyExample[param.name] = "Cricket";
                              else bodyExample[param.name] = "test_value";
                            });
                            return template(selectedEndpoint.path, selectedEndpoint.apiKey, bodyExample, isResultEndpoint);
                          } else {
                            return template(selectedEndpoint.path, selectedEndpoint.apiKey, isResultEndpoint);
                          }
                        })()}
                      </pre>
                      </div>
                      
                     <button 
                      onClick={() => {
                        const template = codeExamples[selectedEndpoint.method]?.[selectedLanguage];
                        let code = '';
                        const isResultEndpoint = openMain === "Cricket Result";
                        
                        if (selectedEndpoint.method === 'POST' && selectedEndpoint.body) {
                          const bodyExample = {};
                          selectedEndpoint.body.forEach(param => {
                            if (param.type === 'number') bodyExample[param.name] = 12345678;
                            else if (param.type === 'boolean') bodyExample[param.name] = true;
                            else if (param.name === 'event_name') bodyExample[param.name] = "India vs Australia";
                            else if (param.name === 'market_name') bodyExample[param.name] = "Match Winner";
                            else if (param.name === 'gameName') bodyExample[param.name] = "Cricket";
                            else bodyExample[param.name] = "test_value";
                          });
                          code = template(selectedEndpoint.path, selectedEndpoint.apiKey, bodyExample, isResultEndpoint);
                        } else {
                          code = template(selectedEndpoint.path, selectedEndpoint.apiKey, isResultEndpoint);
                        }
                        handleCopy(code);
                      }}
                      className={`mt-3 flex items-center gap-2 text-sm ${classes.textSecondary} hover:text-blue-600 transition-colors`}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy code'}
                    </button>
                    </div>

                    {/* Quick Tips */}
                    <div className={`bg-gradient-to-br ${classes.gradient} rounded-2xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-all duration-300`}>
                      <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
                        <Zap size={20} />
                        Quick Integration Tips
                      </h3>
                      <ul className="space-y-3">
                        {[
                          "Always include x-domain header",
                          "Keep your API key secure",
                          "IP whitelist required for production",
                          "Test with staging credentials first",
                          "Use unique market_id for each bet"
                        ].map((tip, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-blue-100">
                            <Check size={16} className="flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Rate Limits */}
                    <div className={`${classes.card} rounded-2xl p-6 shadow-sm border ${classes.border}`}>
                      <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text}`}>
                        <Clock size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                        Rate Limits
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className={classes.textMuted}>Requests per minute:</span>
                          <span className={`font-semibold ${classes.text} bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent`}>60</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className={classes.textMuted}>Concurrent connections:</span>
                          <span className={`font-semibold ${classes.text} bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent`}>10</span>
                        </div>
                        <div className={`mt-4 p-4 ${theme === 'dark' ? 'bg-yellow-900/30 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} rounded-xl border`}>
                          <p className={`text-xs ${theme === 'dark' ? 'text-yellow-300' : 'text-yellow-800'} flex items-start gap-2`}>
                            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                            <span>Contact support for higher rate limits on enterprise plans.</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Panel - Documentation */}
                  <div className="space-y-6 col-span-12 lg:col-span-7">
                    <div>
                    {activeTab === "docs" && (
                      <>
                        {/* Description Card */}
                        <div className={`${classes.card} rounded-2xl p-6 shadow-sm border ${classes.border} transform hover:scale-[1.02] transition-all duration-300`}>
                          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text}`}>
                            <BookOpen size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                            Overview
                          </h3>
                          <p className={`${classes.textSecondary} text-sm mb-4 leading-relaxed`}>{selectedEndpoint.description}</p>
                          <div className={`${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'} p-4 rounded-xl border ${theme === 'dark' ? 'border-blue-800' : 'border-blue-100'}`}>
                            <p className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-800'} flex items-start gap-2`}>
                              <Info size={16} className="flex-shrink-0 mt-0.5" />
                              <span><strong>Note:</strong> All requests require API key and x-domain header for security.</span>
                            </p>
                          </div>
                        </div>

                     {/* Parameters Card */}
                      {(selectedEndpoint.params?.length > 0 || selectedEndpoint.body?.length > 0) && (
                        <div className={`${classes.card} rounded-2xl p-6 shadow-sm border ${classes.border}`}>
                          <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text}`}>
                            <Code size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                            {selectedEndpoint.method === 'POST' ? 'Request Body' : 'Query Parameters'}
                          </h3>
                          <div className="space-y-3">
                            {/* Show query parameters */}
                            {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
                              <>
                                <h4 className={`text-xs font-semibold ${classes.textMuted} mb-2`}>Query Parameters</h4>
                                {selectedEndpoint.params.map((param, i) => (
                                  <div key={`param-${i}`} className={`flex items-start gap-3 p-3 ${classes.bgSecondary} rounded-lg border ${classes.border} hover:border-blue-500 transition-colors`}>
                                    <div className="min-w-[140px]">
                                      <div className="flex items-center gap-2 mb-1">
                                        <code className={`text-sm font-mono ${classes.card} px-2 py-1 rounded border ${classes.border}`}>
                                          {param.name}
                                        </code>
                                        {param.required && (
                                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">*</span>
                                        )}
                                      </div>
                                      {param.location && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${getLocationBadge(param.location)}`}>
                                          {param.location}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className={`text-sm ${classes.textSecondary} mb-1`}>{param.description}</p>
                                      <p className={`text-xs ${classes.textMuted}`}>Type: {param.type}</p>
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}
                            
                            {/* Show body parameters for POST requests */}
                            {selectedEndpoint.method === 'POST' && selectedEndpoint.body && selectedEndpoint.body.length > 0 && (
                              <>
                                <h4 className={`text-xs font-semibold ${classes.textMuted} mb-2 mt-4`}>Body Parameters</h4>
                                {selectedEndpoint.body.map((param, i) => (
                                  <div key={`body-${i}`} className={`flex items-start gap-3 p-3 ${classes.bgSecondary} rounded-lg border ${classes.border} hover:border-blue-500 transition-colors`}>
                                    <div className="min-w-[140px]">
                                      <div className="flex items-center gap-2 mb-1">
                                        <code className={`text-sm font-mono ${classes.card} px-2 py-1 rounded border ${classes.border}`}>
                                          {param.name}
                                        </code>
                                        {param.required && (
                                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">*</span>
                                        )}
                                      </div>
                                      {param.location && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded ${getLocationBadge(param.location)}`}>
                                          {param.location}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex-1">
                                      <p className={`text-sm ${classes.textSecondary} mb-1`}>{param.description}</p>
                                      <p className={`text-xs ${classes.textMuted}`}>Type: {param.type}</p>
                                    </div>
                                  </div>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      )}
                      </>
                    )}
                    {activeTab === "params" && (
                      <div className={`${classes.card} rounded-2xl p-6 shadow-sm border ${classes.border}`}>
                        <h3 className={`font-semibold mb-4 ${classes.text}`}>
                          Test Parameters
                        </h3>
                        
                        {/* Show query parameters */}
                        {selectedEndpoint.params && selectedEndpoint.params.length > 0 && (
                          <div className="mb-6">
                            <h4 className={`text-sm font-medium ${classes.text} mb-3 flex items-center gap-2`}>
                              <Key size={16} />
                              Query Parameters
                            </h4>
                            {selectedEndpoint.params.map((param, i) => (
                              <div key={`param-${i}`} className={`p-4 ${classes.bgSecondary} rounded-lg border ${classes.border} mb-3`}>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <code className={`text-sm font-mono ${classes.text}`}>{param.name}</code>
                                  {param.required && (
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">required</span>
                                  )}
                                  <span className={`text-xs ${classes.textMuted}`}>{param.type}</span>
                                  {param.location && (
                                    <span className={`text-xs px-2 py-0.5 rounded ${getLocationBadge(param.location)}`}>
                                      {param.location}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm ${classes.textSecondary} mb-3`}>{param.description}</p>
                                <input
                                  type={param.type === 'number' ? 'number' : 'text'}
                                  placeholder={`Enter ${param.name}`}
                                  value={testParams[param.name] || ''}
                                  onChange={(e) => handleParamChange(param.name, e.target.value)}
                                  className={`w-full p-2 text-sm rounded-lg border ${classes.border} ${classes.bg} ${classes.text}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Show body parameters for POST requests */}
                        {selectedEndpoint.method === 'POST' && selectedEndpoint.body && selectedEndpoint.body.length > 0 && (
                          <div className="mb-6">
                            <h4 className={`text-sm font-medium ${classes.text} mb-3 flex items-center gap-2`}>
                              <Code size={16} />
                              Body Parameters
                            </h4>
                            {selectedEndpoint.body.map((param, i) => (
                              <div key={`body-${i}`} className={`p-4 ${classes.bgSecondary} rounded-lg border ${classes.border} mb-3`}>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <code className={`text-sm font-mono ${classes.text}`}>{param.name}</code>
                                  {param.required && (
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">required</span>
                                  )}
                                  <span className={`text-xs ${classes.textMuted}`}>{param.type}</span>
                                  {param.location && (
                                    <span className={`text-xs px-2 py-0.5 rounded ${getLocationBadge(param.location)}`}>
                                      {param.location}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm ${classes.textSecondary} mb-3`}>{param.description}</p>
                                <input
                                  type={param.type === 'number' ? 'number' : 'text'}
                                  placeholder={`Enter ${param.name}`}
                                  value={testParams[param.name] || ''}
                                  onChange={(e) => handleParamChange(param.name, e.target.value)}
                                  className={`w-full p-2 text-sm rounded-lg border ${classes.border} ${classes.bg} ${classes.text}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {(selectedEndpoint.params?.length > 0 || (selectedEndpoint.method === 'POST' && selectedEndpoint.body?.length > 0)) ? (
                          <button
                            onClick={handleTestEndpoint}
                            disabled={loading}
                            className={`w-full py-3 rounded-lg text-sm font-medium bg-gradient-to-r ${classes.gradient} text-white hover:shadow-lg transition-all ${
                              loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {loading ? 'Testing...' : 'Run Test'}
                          </button>
                        ) : (
                          <p className={`${classes.textMuted} text-sm`}>No parameters required</p>
                        )}
                      </div>
                    )}

                    {activeTab === "auth" && (
                      <div className={`${classes.card} rounded-2xl p-6 shadow-sm border ${classes.border}`}>
                        <h3 className={`font-semibold mb-4 flex items-center gap-2 ${classes.text}`}>
                          <Lock size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                          Authentication Requirements
                        </h3>
                        
                        <div className="space-y-4">
                          <div className={`p-4 ${classes.bgSecondary} rounded-xl border ${classes.border}`}>
                            <div className="flex items-center gap-2 mb-3">
                              <Key className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                              <span className={`font-medium text-sm ${classes.text}`}>API Key</span>
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded ml-auto">required</span>
                            </div>
                            <p className={`text-sm ${classes.textSecondary} mb-2`}>Passed as query parameter:</p>
                            <code className={`${classes.card} px-3 py-2 rounded-lg text-sm block font-mono border ${classes.border}`}>
                              ?key={selectedEndpoint.apiKey}
                            </code>
                          </div>

                          <div className={`p-4 ${classes.bgSecondary} rounded-xl border ${classes.border}`}>
                            <div className="flex items-center gap-2 mb-3">
                              <Globe className={`w-4 h-4 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                              <span className={`font-medium text-sm ${classes.text}`}>Domain Header</span>
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded ml-auto">required</span>
                            </div>
                            <p className={`text-sm ${classes.textSecondary} mb-2`}>Required header:</p>
                            <code className={`${classes.card} px-3 py-2 rounded-lg text-sm block font-mono border ${classes.border}`}>
                              x-domain: {API_CONFIG.domain}
                            </code>
                          </div>

                          <div className={`p-4 ${classes.bgSecondary} rounded-xl border ${classes.border}`}>
                            <div className="flex items-center gap-2 mb-3">
                              <Shield className={`w-4 h-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`} />
                              <span className={`font-medium text-sm ${classes.text}`}>IP Whitelist</span>
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded ml-auto">required</span>
                            </div>
                            <p className={`text-sm ${classes.textSecondary}`}>Your IP must be whitelisted. Contact admin to add your IP.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "response" && (
                      <div className={`${classes.card} rounded-2xl p-6 shadow-sm border ${classes.border}`}>
                        <h3 className={`font-semibold mb-4 ${classes.text} flex items-center gap-2`}>
                          {responseError ? (
                            <XCircle size={18} className="text-red-500" />
                          ) : responseData ? (
                            <CheckCircle size={18} className="text-green-500" />
                          ) : (
                            <Activity size={18} className="text-blue-500" />
                          )}
                          API Response
                        </h3>
                        
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                          </div>
                        ) : responseData ? (
                          <div className="space-y-4">
                            <div className={`${classes.codeBg} rounded-xl border ${classes.border} p-4 overflow-x-auto max-h-[500px] overflow-y-auto`}>
                              <JSONViewer data={responseData} />
                            </div>
                          </div>
                        ) : responseError ? (
                          <div className={`p-4 ${classes.bgSecondary} rounded-xl border ${classes.border} border-red-500/30`}>
                            <p className={`text-xs ${classes.textMuted} mb-2 flex items-center gap-1`}>
                              <XCircle size={12} className="text-red-500" />
                              Error Response
                            </p>
                            <div className={`${classes.codeBg} rounded-lg p-4 overflow-x-auto`}>
                              <JSONViewer data={responseError} />
                            </div>
                          </div>
                        ) : (
                          <div className={`p-8 text-center ${classes.textMuted}`}>
                            <p>Click "Test Endpoint" to see the response</p>
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                      {/* Share docs */}
                   {/* Share docs */}
                    <div className={`${classes.card} rounded-2xl p-6 shadow-sm border ${classes.border}`}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className={`font-semibold flex items-center gap-2 ${classes.text}`}>
                          <Clock size={18} className={theme === 'dark' ? 'text-blue-400' : 'text-blue-600'} />
                          Share your docs copy and paste
                        </h3>

                        <button
                          onClick={copyDocs}
                          className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                        >
                          Copy
                        </button>
                      </div>

                      <div className="space-y-3">

                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className={classes.textMuted}>Doc Link:</span>
                          <span className={`font-semibold ${classes.text} bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent`}>
                            https://api-docs.space
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className={classes.textMuted}>Your Domain:</span>
                          <span className={`font-semibold ${classes.text} bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent`}>
                            {user.domain}
                          </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                          <span className={classes.textMuted}>Your api key:</span>
                          <span className={`font-semibold ${classes.text} bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent`}>
                            {user.key}
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </main>
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}