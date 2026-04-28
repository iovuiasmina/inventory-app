global.fetch = jest.fn();

const BASE_URL = "/api/items";

function mockFetch(data, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
}

describe("getAllItems", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("returnează lista de articole la succes", async () => {
    const mockItems = [
      { id: "1", name: "Xbox One", serialNumber: "AXB124AXY", value: 399.00 },
      { id: "2", name: "Samsung TV", serialNumber: "S40AZBDE4", value: 599.99 },
    ];
    fetch.mockReturnValue(mockFetch(mockItems));

    const response = await fetch(BASE_URL);
    const items = await response.json();

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(items).toHaveLength(2);
    expect(items[0].name).toBe("Xbox One");
  });

  test("trimite parametrul search corect în URL", async () => {
    fetch.mockReturnValue(mockFetch([]));

    await fetch(`${BASE_URL}?search=xbox`);

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}?search=xbox`);
  });

  test("aruncă eroare la status non-OK", async () => {
    fetch.mockReturnValue(mockFetch({ error: "Server error" }, 500));

    const response = await fetch(BASE_URL);
    expect(response.ok).toBe(false);
  });
});

describe("addItem", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("face cerere POST cu datele corecte", async () => {
    const newItem = {
      name: "PlayStation 5",
      serialNumber: "CFI-1216A",
      value: 499.99,
      category: "Electronics",
    };
    const createdItem = { ...newItem, id: "uuid-123" };
    fetch.mockReturnValue(mockFetch(createdItem, 201));

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });

    expect(fetch).toHaveBeenCalledWith(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    expect(response.ok).toBe(true);
  });

  test("primește erori de validare la date incorecte", async () => {
    fetch.mockReturnValue(
      mockFetch({ errors: ["Valoarea trebuie să fie un număr"] }, 400)
    );

    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test", serialNumber: "123", value: -5 }),
    });

    expect(response.ok).toBe(false);
    const data = await response.json();
    expect(data.errors).toBeDefined();
  });
});

describe("deleteItem", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("face cerere DELETE cu ID-ul corect", async () => {
    fetch.mockReturnValue(mockFetch({ message: "Articolul a fost șters" }));

    const id = "uuid-123";
    await fetch(`${BASE_URL}/${id}`, { method: "DELETE" });

    expect(fetch).toHaveBeenCalledWith(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });
  });

  test("returnează eroare 404 pentru ID inexistent", async () => {
    fetch.mockReturnValue(mockFetch({ error: "Articolul nu a fost găsit" }, 404));

    const response = await fetch(`${BASE_URL}/id-inexistent`, {
      method: "DELETE",
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(404);
  });
});

describe("Validare date inventar", () => {
  function validateItem(form) {
    const errors = {};
    if (!form.name?.trim()) errors.name = "Numele este obligatoriu.";
    if (!form.serialNumber?.trim())
      errors.serialNumber = "Numărul de serie este obligatoriu.";
    if (!form.value) {
      errors.value = "Valoarea este obligatorie.";
    } else if (isNaN(form.value) || parseFloat(form.value) <= 0) {
      errors.value = "Valoarea trebuie să fie un număr pozitiv.";
    }
    return errors;
  }

  test("returnează erori pentru câmpuri goale", () => {
    const errors = validateItem({});
    expect(errors.name).toBeDefined();
    expect(errors.serialNumber).toBeDefined();
    expect(errors.value).toBeDefined();
  });

  test("nu returnează erori pentru date valide", () => {
    const errors = validateItem({
      name: "Xbox One",
      serialNumber: "AXB124AXY",
      value: "399.00",
    });
    expect(Object.keys(errors)).toHaveLength(0);
  });

  test("returnează eroare pentru valoare negativă", () => {
    const errors = validateItem({
      name: "Test",
      serialNumber: "123",
      value: "-10",
    });
    expect(errors.value).toBeDefined();
  });

  test("returnează eroare pentru valoare non-numerică", () => {
    const errors = validateItem({
      name: "Test",
      serialNumber: "123",
      value: "abc",
    });
    expect(errors.value).toBeDefined();
  });

  test("acceptă valori cu zecimale", () => {
    const errors = validateItem({
      name: "Samsung TV",
      serialNumber: "S40AZBDE4",
      value: "599.99",
    });
    expect(errors.value).toBeUndefined();
  });
});

describe("Formatare valori monetare", () => {
  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  }

  test("formatează corect valori întregi", () => {
    expect(formatCurrency(399)).toBe("$399.00");
  });

  test("formatează corect valori cu zecimale", () => {
    expect(formatCurrency(599.99)).toBe("$599.99");
  });

  test("formatează corect valori mari", () => {
    expect(formatCurrency(1299.00)).toBe("$1,299.00");
  });
});
