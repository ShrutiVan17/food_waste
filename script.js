const storageKey = "freshturn-platform-state-v2";

const seedState = {
  activeUserId: "manager-maya",
  activeView: "overview",
  users: [
    { id: "admin-oliver", name: "Oliver Grant", role: "Admin", branchId: null },
    { id: "manager-maya", name: "Maya Torres", role: "Manager", branchId: "downtown" },
    { id: "manager-jon", name: "Jon Patel", role: "Manager", branchId: "river-north" },
    { id: "customer-ava", name: "Ava Brooks", role: "Customer", branchId: null },
  ],
  branches: [
    {
      id: "downtown",
      name: "Downtown Chicago",
      manager: "Maya Torres",
      closingSoon: true,
      pickupWindow: "8:30 PM - 9:30 PM",
    },
    {
      id: "river-north",
      name: "River North",
      manager: "Jon Patel",
      closingSoon: false,
      pickupWindow: "9:00 PM - 10:00 PM",
    },
    {
      id: "lincoln-park",
      name: "Lincoln Park",
      manager: "Store Rotation",
      closingSoon: true,
      pickupWindow: "8:00 PM - 9:00 PM",
    },
  ],
  inventory: [
    {
      id: crypto.randomUUID(),
      branchId: "downtown",
      name: "Grilled Chicken Wrap",
      category: "Prepared meal",
      quantity: 14,
      price: 11.5,
      hoursToExpiry: 5,
      risk: "High",
    },
    {
      id: crypto.randomUUID(),
      branchId: "downtown",
      name: "Berry Yogurt Parfait",
      category: "Dessert",
      quantity: 11,
      price: 5.5,
      hoursToExpiry: 4,
      risk: "High",
    },
    {
      id: crypto.randomUUID(),
      branchId: "river-north",
      name: "Roasted Veggie Bowl",
      category: "Prepared meal",
      quantity: 8,
      price: 10.5,
      hoursToExpiry: 7,
      risk: "Medium",
    },
    {
      id: crypto.randomUUID(),
      branchId: "river-north",
      name: "Sourdough Garlic Bread",
      category: "Bakery",
      quantity: 9,
      price: 6,
      hoursToExpiry: 8,
      risk: "Medium",
    },
    {
      id: crypto.randomUUID(),
      branchId: "lincoln-park",
      name: "Fresh Salad Bowl",
      category: "Produce",
      quantity: 7,
      price: 9,
      hoursToExpiry: 6,
      risk: "Medium",
    },
    {
      id: crypto.randomUUID(),
      branchId: "lincoln-park",
      name: "Chocolate Mousse Cup",
      category: "Dessert",
      quantity: 10,
      price: 4.75,
      hoursToExpiry: 5,
      risk: "Low",
    },
  ],
  reservations: [
    {
      id: crypto.randomUUID(),
      itemId: null,
      itemName: "Berry Yogurt Parfait",
      branchId: "downtown",
      customerName: "Ava Brooks",
      quantity: 2,
      total: 4.96,
      status: "Reserved",
      pickupWindow: "8:30 PM - 9:30 PM",
      createdAt: "Today, 6:10 PM",
    },
  ],
};

let state = loadState();

const profileSelect = document.getElementById("profileSelect");
const signInButton = document.getElementById("signInButton");
const exportReportButton = document.getElementById("exportReportButton");
const resetDemoButton = document.getElementById("resetDemoButton");
const toggleMobileNav = document.getElementById("toggleMobileNav");
const sidebar = document.getElementById("sidebar");
const statsGrid = document.getElementById("statsGrid");
const branchGrid = document.getElementById("branchGrid");
const actionQueue = document.getElementById("actionQueue");
const alertFeed = document.getElementById("alertFeed");
const itemBranch = document.getElementById("itemBranch");
const inventoryForm = document.getElementById("inventoryForm");
const inventoryTable = document.getElementById("inventoryTable");
const inventoryCount = document.getElementById("inventoryCount");
const campaignList = document.getElementById("campaignList");
const marketplaceNotice = document.getElementById("marketplaceNotice");
const filterBranch = document.getElementById("filterBranch");
const filterCategory = document.getElementById("filterCategory");
const filterPrice = document.getElementById("filterPrice");
const dealGrid = document.getElementById("dealGrid");
const ordersList = document.getElementById("ordersList");
const branchPerformance = document.getElementById("branchPerformance");
const activeUserName = document.getElementById("activeUserName");
const activeUserRole = document.getElementById("activeUserRole");
const sidebarUserName = document.getElementById("sidebarUserName");
const sidebarUserMeta = document.getElementById("sidebarUserMeta");

const views = {
  overview: document.getElementById("overviewView"),
  operations: document.getElementById("operationsView"),
  marketplace: document.getElementById("marketplaceView"),
  orders: document.getElementById("ordersView"),
  insights: document.getElementById("insightsView"),
};

const marketplaceFilters = {
  branch: "all",
  category: "all",
  price: "all",
};

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));

    if (saved?.users?.length && saved?.branches?.length) {
      return saved;
    }
  } catch (error) {
    console.warn("Could not restore state.", error);
  }

  return structuredClone(seedState);
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function currency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function activeUser() {
  return state.users.find((user) => user.id === state.activeUserId) || state.users[0];
}

function branchById(branchId) {
  return state.branches.find((branch) => branch.id === branchId);
}

function markdownPercent(item) {
  const branch = branchById(item.branchId);

  if (!branch?.closingSoon || item.hoursToExpiry > 8 || item.quantity <= 0) {
    return 0;
  }

  const riskBase = {
    Low: 20,
    Medium: 35,
    High: 50,
  };

  const expiryBoost = item.hoursToExpiry <= 4 ? 5 : 0;
  return Math.min(riskBase[item.risk] + expiryBoost, 55);
}

function salePrice(item) {
  return Number((item.price * (1 - markdownPercent(item) / 100)).toFixed(2));
}

function rescueWeight(item) {
  return Number((item.quantity * 0.42).toFixed(1));
}

function eligibleDeals() {
  return state.inventory
    .filter((item) => markdownPercent(item) > 0)
    .sort((left, right) => markdownPercent(right) - markdownPercent(left) || left.hoursToExpiry - right.hoursToExpiry);
}

function reservationCode() {
  return `FT-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function operationalAlerts() {
  const alerts = [];

  state.inventory.forEach((item) => {
    const branch = branchById(item.branchId);

    if (item.quantity <= 3) {
      alerts.push({
        title: `${item.name} is running low`,
        detail: `${branch.name} has only ${item.quantity} portions left.`,
        tone: "high",
      });
    }

    if (branch.closingSoon && item.hoursToExpiry <= 4 && item.quantity > 0) {
      alerts.push({
        title: `Urgent markdown recommended for ${item.name}`,
        detail: `${branch.name} should clear this item within ${item.hoursToExpiry} hours.`,
        tone: item.risk.toLowerCase(),
      });
    }
  });

  state.reservations.slice(0, 3).forEach((reservation) => {
    alerts.push({
      title: `Reservation placed for ${reservation.itemName}`,
      detail: `${reservation.customerName} booked pickup at ${branchById(reservation.branchId).name}.`,
      tone: "low",
    });
  });

  return alerts.slice(0, 6);
}

function statCards() {
  const deals = eligibleDeals();
  const wasteKg = deals.reduce((sum, item) => sum + rescueWeight(item), 0);
  const recoveredRevenue = deals.reduce((sum, item) => sum + salePrice(item) * item.quantity, 0);
  const mealsAvailable = deals.reduce((sum, item) => sum + item.quantity, 0);
  const reservations = state.reservations.length;

  return [
    { label: "Meals available tonight", value: `${mealsAvailable}`, note: "Discount-ready inventory" },
    { label: "Potential waste prevented", value: `${wasteKg.toFixed(1)} kg`, note: "Edible food saved" },
    { label: "Recovered revenue", value: currency(recoveredRevenue), note: "From rescue pricing" },
    { label: "Reservations placed", value: `${reservations}`, note: "Customer pickup demand" },
  ];
}

function renderProfileOptions() {
  profileSelect.innerHTML = state.users
    .map((user) => `<option value="${user.id}">${user.name} - ${user.role}</option>`)
    .join("");
  profileSelect.value = state.activeUserId;
}

function renderFilterOptions() {
  filterBranch.innerHTML = [
    `<option value="all">All branches</option>`,
    ...state.branches.map((branch) => `<option value="${branch.id}">${branch.name}</option>`),
  ].join("");

  const categories = [...new Set(state.inventory.map((item) => item.category))];
  filterCategory.innerHTML = [
    `<option value="all">All categories</option>`,
    ...categories.map((category) => `<option value="${category}">${category}</option>`),
  ].join("");

  filterBranch.value = marketplaceFilters.branch;
  filterCategory.value = marketplaceFilters.category;
  filterPrice.value = marketplaceFilters.price;
}

function renderUserState() {
  const user = activeUser();
  const branch = user.branchId ? branchById(user.branchId) : null;
  activeUserName.textContent = `${user.name}`;
  activeUserRole.textContent = branch ? `${user.role} for ${branch.name}` : `${user.role} workspace access`;
  sidebarUserName.textContent = user.name;
  sidebarUserMeta.textContent = branch ? `${user.role} | ${branch.name}` : `${user.role} | Multi-branch view`;
}

function renderStats() {
  statsGrid.innerHTML = statCards()
    .map(
      (card) => `
        <article>
          <span>${card.label}</span>
          <strong>${card.value}</strong>
          <span>${card.note}</span>
        </article>
      `
    )
    .join("");
}

function renderBranches() {
  const user = activeUser();
  const visibleBranches = user.role === "Manager" ? state.branches.filter((branch) => branch.id === user.branchId) : state.branches;

  branchGrid.innerHTML = visibleBranches
    .map((branch) => {
      const branchItems = state.inventory.filter((item) => item.branchId === branch.id);
      const offers = branchItems.filter((item) => markdownPercent(item) > 0).length;

      return `
        <article class="branch-card ${branch.closingSoon ? "closed" : ""}">
          <header>
            <div>
              <h3>${branch.name}</h3>
              <p class="meta">Manager: ${branch.manager}</p>
            </div>
            <span class="chip ${branch.closingSoon ? "accent" : ""}">
              ${branch.closingSoon ? "Closing mode on" : "Normal service"}
            </span>
          </header>
          <div class="branch-actions">
            <span class="chip">${branchItems.length} inventory lines</span>
            <span class="chip">${offers} live deals</span>
            <span class="chip">${branch.pickupWindow}</span>
          </div>
          ${
            user.role !== "Customer"
              ? `<button class="ghost-button" type="button" data-action="toggle-closing" data-branch-id="${branch.id}">
                  ${branch.closingSoon ? "Disable closing mode" : "Enable closing mode"}
                </button>`
              : ""
          }
        </article>
      `;
    })
    .join("");
}

function renderActionQueue() {
  const items = eligibleDeals().slice(0, 6);

  actionQueue.innerHTML = items.length
    ? items
        .map((item) => {
          const branch = branchById(item.branchId);
          return `
            <article class="queue-item">
              <header>
                <strong>${item.name}</strong>
                <span class="risk-tag ${item.risk.toLowerCase()}">${item.risk} risk</span>
              </header>
              <p>${branch.name} should sell ${item.quantity} portions within ${item.hoursToExpiry} hours.</p>
              <p class="meta">Suggested markdown: ${markdownPercent(item)}% | Rescue revenue: ${currency(salePrice(item) * item.quantity)}</p>
            </article>
          `;
        })
        .join("")
    : `<article class="queue-item"><p>No urgent rescue tasks right now. Turn on closing mode for a branch when service is ending.</p></article>`;
}

function renderAlertFeed() {
  const alerts = operationalAlerts();

  alertFeed.innerHTML = alerts.length
    ? alerts
        .map(
          (alert) => `
            <article class="alert-card">
              <header>
                <strong>${alert.title}</strong>
                <span class="risk-tag ${alert.tone}">${alert.tone}</span>
              </header>
              <p>${alert.detail}</p>
            </article>
          `
        )
        .join("")
    : `<article class="alert-card"><p>No active alerts right now.</p></article>`;
}

function branchOptionsForUser() {
  const user = activeUser();
  return user.role === "Manager" ? state.branches.filter((branch) => branch.id === user.branchId) : state.branches;
}

function renderBranchOptions() {
  itemBranch.innerHTML = branchOptionsForUser()
    .map((branch) => `<option value="${branch.id}">${branch.name}</option>`)
    .join("");
}

function syncRoleAccess() {
  const user = activeUser();
  const canManageInventory = user.role !== "Customer";

  Array.from(inventoryForm.elements).forEach((element) => {
    element.disabled = !canManageInventory;
  });
}

function renderInventory() {
  const user = activeUser();
  const items = user.role === "Manager" ? state.inventory.filter((item) => item.branchId === user.branchId) : state.inventory;

  inventoryCount.textContent = `${items.length} items`;
  inventoryTable.innerHTML = items
    .map((item) => {
      const branch = branchById(item.branchId);
      const markdown = markdownPercent(item);
      return `
        <article class="inventory-row">
          <header>
            <div>
              <h3>${item.name}</h3>
              <p class="meta">${item.category} | ${branch.name}</p>
            </div>
            <span class="risk-tag ${item.risk.toLowerCase()}">${item.risk} risk</span>
          </header>
          <div class="inventory-meta">
            <span class="chip">${item.quantity} portions</span>
            <span class="chip">${currency(item.price)} regular</span>
            <span class="chip">${item.hoursToExpiry} hours to expiry</span>
            <span class="chip">${markdown ? `${markdown}% markdown ready` : "No markdown yet"}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCampaigns() {
  const user = activeUser();
  const campaigns = eligibleDeals().filter((item) => user.role !== "Manager" || item.branchId === user.branchId);

  campaignList.innerHTML = campaigns.length
    ? campaigns
        .map((item) => {
          const branch = branchById(item.branchId);
          return `
            <article class="campaign-card">
              <header>
                <div>
                  <strong>${item.name}</strong>
                  <p class="meta">${branch.name} | ${item.quantity} portions left</p>
                </div>
                <span class="chip accent">${markdownPercent(item)}% off</span>
              </header>
              <p>Push this item to the marketplace before ${branch.pickupWindow}. Estimated rescue weight: ${rescueWeight(item)} kg.</p>
            </article>
          `;
        })
        .join("")
    : `<article class="campaign-card"><p>No markdown campaigns are active. Enable closing mode for a branch with expiring food.</p></article>`;
}

function renderMarketplace() {
  const user = activeUser();
  const deals = eligibleDeals().filter((item) => {
    const matchesBranch = marketplaceFilters.branch === "all" || item.branchId === marketplaceFilters.branch;
    const matchesCategory = marketplaceFilters.category === "all" || item.category === marketplaceFilters.category;
    const matchesPrice =
      marketplaceFilters.price === "all" || salePrice(item) <= Number(marketplaceFilters.price);

    return matchesBranch && matchesCategory && matchesPrice;
  });

  marketplaceNotice.textContent =
    user.role === "Customer"
      ? "You are in customer mode. Reserve any available discounted meal for pickup."
      : "This is the public customer-facing offer wall your restaurant would show near closing time.";

  dealGrid.innerHTML = deals.length
    ? deals
        .map((item) => {
          const branch = branchById(item.branchId);
          return `
            <article class="deal-card">
              <header>
                <div>
                  <h3>${item.name}</h3>
                  <p class="meta">${item.category} | ${branch.name}</p>
                </div>
                <span class="risk-tag ${item.risk.toLowerCase()}">${markdownPercent(item)}% off</span>
              </header>
              <div class="price-line">
                <strong>${currency(salePrice(item))}</strong>
                <span>${currency(item.price)}</span>
              </div>
              <p>${item.quantity} portions available. Pickup window: ${branch.pickupWindow}. Best sold within ${item.hoursToExpiry} hours.</p>
              <div class="deal-meta">
                <span class="chip">${rescueWeight(item)} kg at risk</span>
                <span class="chip">${branch.closingSoon ? "Closing mode active" : "Normal service"}</span>
              </div>
              ${
                user.role === "Customer"
                  ? `<button class="primary-button" type="button" data-action="reserve-item" data-item-id="${item.id}">
                      Reserve 1 meal
                    </button>`
                  : `<button class="ghost-button" type="button">
                      Switch to customer profile to reserve
                    </button>`
              }
            </article>
          `;
        })
        .join("")
    : `<article class="deal-card"><p>No discounted meals are live yet. Turn on closing mode for a branch that has perishable leftovers.</p></article>`;
}

function renderOrders() {
  const user = activeUser();
  const reservations = state.reservations.filter((reservation) => {
    if (user.role === "Customer") {
      return reservation.customerName === user.name;
    }

    if (user.role === "Manager") {
      return reservation.branchId === user.branchId;
    }

    return true;
  });

  ordersList.innerHTML = reservations.length
    ? reservations
        .map((reservation) => {
          const branch = branchById(reservation.branchId);
          return `
            <article class="order-card">
              <header>
                <div>
                  <h3>${reservation.itemName}</h3>
                  <p class="meta">${branch.name} | ${reservation.createdAt}</p>
                </div>
                <span class="chip accent">${reservation.status}</span>
              </header>
              <div class="order-meta">
                <span class="chip">${reservation.customerName}</span>
                <span class="chip">${reservation.quantity} meal</span>
                <span class="chip">${currency(reservation.total)}</span>
                <span class="chip">${reservation.pickupWindow}</span>
                <span class="chip">${reservation.pickupCode}</span>
              </div>
            </article>
          `;
        })
        .join("")
    : `<article class="order-card"><p>No reservations in this view yet.</p></article>`;
}

function renderInsights() {
  const performance = state.branches.map((branch) => {
    const deals = eligibleDeals().filter((item) => item.branchId === branch.id);
    const reservedRevenue = state.reservations
      .filter((reservation) => reservation.branchId === branch.id)
      .reduce((sum, reservation) => sum + reservation.total, 0);

    return {
      branchName: branch.name,
      reservedRevenue,
      openDeals: deals.length,
    };
  });

  const maxRevenue = Math.max(...performance.map((branch) => branch.reservedRevenue), 1);

  branchPerformance.innerHTML = performance
    .map(
      (branch) => `
        <article class="chart-bar">
          <header>
            <strong>${branch.branchName}</strong>
            <span class="meta">${currency(branch.reservedRevenue)} reserved | ${branch.openDeals} live deals</span>
          </header>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${(branch.reservedRevenue / maxRevenue) * 100}%"></div>
          </div>
        </article>
      `
    )
    .join("");
}

function setActiveView(viewName) {
  state.activeView = viewName;
  Object.entries(views).forEach(([key, section]) => {
    section.classList.toggle("active", key === viewName);
  });

  document.querySelectorAll(".nav-link").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });

  saveState();
}

function syncUI() {
  renderProfileOptions();
  renderUserState();
  syncRoleAccess();
  renderFilterOptions();
  renderStats();
  renderBranches();
  renderActionQueue();
  renderAlertFeed();
  renderBranchOptions();
  renderInventory();
  renderCampaigns();
  renderMarketplace();
  renderOrders();
  renderInsights();
  setActiveView(state.activeView || "overview");
}

function reserveItem(itemId) {
  const item = state.inventory.find((entry) => entry.id === itemId);
  const user = activeUser();

  if (user.role !== "Customer") {
    window.alert("Switch to the customer demo profile to reserve discounted meals.");
    return;
  }

  if (!item || item.quantity <= 0) {
    return;
  }

  item.quantity -= 1;
  state.reservations.unshift({
    id: crypto.randomUUID(),
    itemId: item.id,
    itemName: item.name,
    branchId: item.branchId,
    customerName: user.name,
    quantity: 1,
    total: salePrice(item),
    status: "Reserved",
    pickupWindow: branchById(item.branchId).pickupWindow,
    pickupCode: reservationCode(),
    createdAt: "Just now",
  });

  saveState();
  syncUI();
  setActiveView("orders");
}

document.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-action]");

  if (actionTarget) {
    const { action, branchId, itemId } = actionTarget.dataset;

    if (action === "toggle-closing" && branchId) {
      const branch = branchById(branchId);
      branch.closingSoon = !branch.closingSoon;
      saveState();
      syncUI();
      return;
    }

    if (action === "reserve-item" && itemId) {
      reserveItem(itemId);
      return;
    }
  }

  const navTarget = event.target.closest(".nav-link");

  if (navTarget) {
    setActiveView(navTarget.dataset.view);
  }
});

signInButton.addEventListener("click", () => {
  state.activeUserId = profileSelect.value;
  saveState();
  syncUI();
});

inventoryForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(inventoryForm);
  state.inventory.unshift({
    id: crypto.randomUUID(),
    branchId: String(formData.get("itemBranch")),
    name: String(formData.get("itemName")).trim(),
    category: String(formData.get("itemCategory")),
    quantity: Number(formData.get("itemQuantity")),
    price: Number(formData.get("itemPrice")),
    hoursToExpiry: Number(formData.get("itemExpiry")),
    risk: String(formData.get("itemRisk")),
  });

  inventoryForm.reset();
  document.getElementById("itemQuantity").value = "8";
  document.getElementById("itemPrice").value = "9.50";
  document.getElementById("itemExpiry").value = "6";
  document.getElementById("itemRisk").value = "Medium";
  renderBranchOptions();
  saveState();
  syncUI();
});

resetDemoButton.addEventListener("click", () => {
  state = structuredClone(seedState);
  saveState();
  syncUI();
});

filterBranch.addEventListener("change", () => {
  marketplaceFilters.branch = filterBranch.value;
  renderMarketplace();
});

filterCategory.addEventListener("change", () => {
  marketplaceFilters.category = filterCategory.value;
  renderMarketplace();
});

filterPrice.addEventListener("change", () => {
  marketplaceFilters.price = filterPrice.value;
  renderMarketplace();
});

exportReportButton.addEventListener("click", () => {
  const report = {
    exportedAt: new Date().toISOString(),
    activeUser: activeUser().name,
    summary: statCards(),
    branches: state.branches,
    activeDeals: eligibleDeals().map((item) => ({
      branch: branchById(item.branchId).name,
      item: item.name,
      quantity: item.quantity,
      markdown: markdownPercent(item),
      salePrice: salePrice(item),
    })),
    reservations: state.reservations,
  };

  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "freshturn-report.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

toggleMobileNav.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

syncUI();
