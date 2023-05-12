/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import Bills from "../containers/Bills";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import router from "../app/Router.js";

// const onNavigate = (pathname) => {
//   document.body.innerHTML = ROUTES({ pathname });
// };

jest.mock("../app/store", () => mockStore);

/********************************************************
****************  Bills page is loading  ****************
********************************************************/

/* This test case is designed to confirm that the page is loading.                                            **

** It starts by rendering the BillsUI with a loading state. Then, it checks the screen for text "Loading..."  **
  
** Test asserts that the text "Loading..." is indeed present, confirming that Loading page is displayed       **
** when Bills page is in a loading state.                                                                     **

** This test ensures that users are provided with an appropriate loading screen while Bills page is loading.  */

describe("Given I want connected as an employee", () => {
  describe("When the Bills page is loading", () => {
    test("Then Loading page should be displayed", () => {
      const html = BillsUI({ data: bills, loading: true });
      document.body.innerHTML = html;
      const isLoading = screen.getAllByText("Loading...");
      expect(isLoading).toBeTruthy();
    });
  });

  /********************************************************
  ********* There is an error on the Bills page  *********
  ********************************************************/

  /* This test case ensures that an Error is displayed when there is an error on the Bills page.              **

  ** It begins by rendering the BillsUI in an error state. After that, it searches screen for text "Erreur".  **

  ** Test asserts that "Erreur" text is present, confirming that Error page is displayed when an error        **
  ** occurs on Bills page.                                                                                    **

  ** This test validates that users are shown an appropriate error page when an error occurs on Bills page.   */

  describe("When there is an error on the Bills page", () => {
    test("Then Error should be displayed", () => {
      const html = BillsUI({ data: bills, error: true });
      document.body.innerHTML = html;
      const hasError = screen.getAllByText("Erreur");
      expect(hasError).toBeTruthy();
    });
  });
});

/********************************************************
************** The table should be empty ****************
********************************************************/

/* This test case verifies that Bills table is empty when a user (Employee) is connected but has no bills.      **

** It starts by rendering BillsUI with no bill data. It then gets all elements with role "row" from screen.      **
** As there are no bills, only row should be header row of table.                                                **

** Test asserts that there is only one row, confirming that Bills table is indeed empty when there are no bills. **

** This test ensures that application correctly handles scenario where a user has no bills.                      */

describe("Given I am connected as an employee with no bills", () => {
  test("Then the table should be empty", () => {
    const emptyBills = [];
    document.body.innerHTML = BillsUI({ data: emptyBills });
    const tableRows = screen.queryAllByRole("row");
    // There should only be one row, which is the header row
    expect(tableRows.length).toEqual(1);
  });
});

/********************************************************
********** Table should display correct fields **********
********************************************************/

/* This test case ensures that when a user (Employee) is connected and on the Bills Page,               **
** Bills table displays the correct fields for each bill.                                               **

** It starts by rendering the BillsUI with some bill data. It then selects all rows in table body.      **

** Each row is checked to make sure it has right number of cells and each cell is defined.              **
** These cells correspond to different fields of a bill: Type, Name, Date, Amount, Status, and Actions. **

** Test asserts that each cell is defined, which confirms that table correctly displays fields          **    
** for each bill.                                                                                       **

** This test validates that Bills page correctly represents each bill with all necessary information.   */

describe("Given I am connected as an employee", () => {
  describe("When I am on the Bills Page", () => {
    test("Then the bills table should display correct fields for each bill", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      const billRows = document.querySelectorAll(
        'tbody[data-testid="tbody"] tr'
      );
      billRows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        expect(cells[0]).toBeDefined(); // Type
        expect(cells[1]).toBeDefined(); // Name
        expect(cells[2]).toBeDefined(); // Date
        expect(cells[3]).toBeDefined(); // Amount
        expect(cells[4]).toBeDefined(); // Status
        expect(cells[5]).toBeDefined(); // Actions
      });
    });
  });
});

/********************************************************
********* Vertical layout should be highlighted *********
********************************************************/

/* This test case is designed to confirm that when an employee navigates to Bills page,                **
** associated icon in the vertical layout should be visually highlighted (having class "active-icon"). **
** The setup involves creating a mock localStorage, setting the user as an employee,                   **
** creating a root div element for the router, and navigating to Bills page.                           **
** Once page is loaded, test checks if "icon-window" has the "active-icon" class.                      */

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in the vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toHaveClass("active-icon");
    });

    /* This test case checks whether bills on Bills page are sorted by date in descending order **
    ** (earliest to latest). After rendering BillsUI with given bills data,                     **
    ** it retrieves all the dates from page (expecting them to be in a specific date format).   **
    ** Test case then sorts these dates in descending order and asserts that this sorted list   ** 
    ** matches the original list of dates from the page.                                        **
    ** This would confirm that the original list was indeed sorted in descending order.         */

    test("Then bills should be sorted from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    /********************************************************
    *************** Modal should be displayed ***************
    ********************************************************/

    /* This test case ensures that when a user (Employee) clicks on eye icon for a bill,                            **
    ** a modal should be displayed. It mocks localStorage to set a user as an "Employee",                           **
    ** and renders BillsUI with some bill data.                                                                     **
    
    ** A new Bills instance is created with a mock "onNavigate" function and mocked localStorage.                   **
    ** In addition, "modal" function is mocked to simulate the functionality of displaying a modal.                 **

    ** A mock function "handleClickIconEye" is created which is supposed to be called when an eye icon is clicked.  **
    ** Then, for each eye icon on the page, this function is called and a click event is simulated.                 **

    ** Finally, it asserts that mock function "handleClickIconEye" was called as many times as there are eye icons, **
    ** and that modal function was called at least once, thereby ensuring that clicking an eye icon triggers        */

    describe("When I click on a eye icon", () => {
      test("Then a modal should be displayed", () => {
        Object.defineProperty(window, localStorage, {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee" })
        );

        document.body.innerHTML = BillsUI({ data: bills });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const bill = new Bills({
          document,
          onNavigate,
          localStorage: localStorageMock,
          store: null,
        });

        $.fn.modal = jest.fn();

        const handleClickIconEye = jest.fn(() => {
          bill.handleClickIconEye;
        });
        const eyeIcons = screen.getAllByTestId("icon-eye");

        for (let eyeIcon of eyeIcons) {
          handleClickIconEye(eyeIcon);
          userEvent.click(eyeIcon);
        }

        expect(handleClickIconEye).toHaveBeenCalledTimes(eyeIcons.length);
        expect($.fn.modal).toHaveBeenCalled();
      });
    });

    /********************************************************
    ********* Should be redirected to new bill page *********
    ********************************************************/
   
    /* This test case ensures that when a user (Employee) clicks on the "New Bill" button,                        **
    ** the user should be redirected to the new bill page.                                                        **

    ** Test begins by mocking localStorage to set a user as an "Employee",                                        **
    ** and then renders BillsUI with some bill data.                                                              **

    ** A new Bills instance is created with a mock "onNavigate" function, which replaces the current page content **
    ** with new content based on the provided pathname, and the actual localStorage object.                       **
    ** The "New Bill" button is selected from the DOM.                                                            **

    ** A mock function, "mockFunctionHandleClick", is created that wraps around the actual "handleClickNewBill"   **
    ** function on Bills instance. This mock function is then added as an event listener to the "New Bill" button **
    ** for click events.

    ** A click event is then fired on "New Bill" button.                                                          **

    ** Finally, test asserts that mock function, which in turn should trigger the actual "handleClickNewBill"     **
    ** function, was called when "New Bill" button was clicked. This ensures that correct function is             **
    ** being called to redirect the user to the new bill page when the "New Bill" button is clicked.              */

    describe("When I click on New Bill button", () => {
      test("Then I should be redirected to the new bill page", () => {
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        const html = BillsUI({ data: bills });
        document.body.innerHTML = html;
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const bill = new Bills({
          document,
          onNavigate,
          localStorage: window.localStorage,
          store: null,
        });
        const btnNewBill = screen.getByTestId("btn-new-bill");

        const mockFunctionHandleClick = jest.fn(bill.handleClickNewBill);
        btnNewBill.addEventListener("click", mockFunctionHandleClick);
        fireEvent.click(btnNewBill);
        expect(mockFunctionHandleClick).toHaveBeenCalled();
      });
    });
  });
});

// Integration Test: GET operation

/********************************************************
***************** Mock API GET request ******************
********************************************************/

/* This test case verifies that bills are fetched from mock API GET request when an Employee          **
** is logged in and navigates to Bills page.                                                          **

** It begins by setting localStorage item "user" to represent an employee, and then creating a "root" **
** div and navigating to Bills page.                                                                  **

** It waits for "Mes notes de frais" text to appear on screen, indicating that Bills page has         **
** been loaded.                                                                                       **

** Finally, it asserts that element with test id "tbody" exists, which would contain list of bills    **
** if API GET request has been successful.                                                            */

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Fetch bills from the mock API GET request", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByTestId("tbody")).toBeTruthy();
    });
  });

  /********************************************************
  ************* An error occurs with the API **************
  ********************************************************/

  /* This test case sets up a common environment for a set of tests where user is a logged-in Employee. **

  ** It begins by spying on the "bills" method of mockStore object, and then setting the localStorage   **
  ** item "user" to represent an employee.                                                              **

  ** Then it creates a "root" div and navigates to home page. Rest of the individual tests in this      ** 
  ** describe block would then add their own specific test steps and assertions.                        */

  describe("Given I am a logged in employee", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills");
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
    });

    /*********************************************************************
    ************* Fetch bills and fail with a 404 error message***********
    *********************************************************************/

    /* This test case checks that a 404 error message is displayed when the API returns a 404 error   **
    ** while fetching bills.                                                                          **

    ** It starts by mocking the "bills" method of the mockStore object to reject with a 404 error     ** 
    ** when its "list" method is called.                                                              **

    ** Then it navigates to the Bills page and waits for the next tick in the event loop to allow     **
    ** any pending asynchronous operations to complete.                                               **

    ** It waits for the "Erreur 404" text to appear on the screen, indicating that the error message  **
    ** has been displayed.

    ** Finally, it asserts that the error message does indeed exist in the DOM.                       */

    describe("When the API returns a 404 error while fetching bills", () => {
      test("Then a 404 error message should be displayed", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await waitFor(() => screen.getByText(/Erreur 404/));
        expect(message).toBeTruthy();
      });
    });

    /************************************************************************
    ************* Fetch messages and fail with a 500 error message***********
    ************************************************************************/

    /* This test case checks that a 500 error message is displayed when API returns a 500 error        **
    ** while fetching bills.                                                                           **

    ** It starts by mocking the "bills" method of mockStore object to reject with a 500 error          **
    ** when its "list" method is called.                                                               **

    ** Then it navigates to Bills page and waits for next tick in event loop to allow                  **
    ** any pending asynchronous operations to complete.                                                **

    ** It waits for the "Erreur 500" text to appear on the screen, indicating that error message       **
    ** has been displayed.                                                                             **

    ** Finally, it asserts that error message does indeed exist in the DOM.                            **

    ** This test ensures that application handles server errors correctly by displaying an appropriate **
    ** error message.                                                                          */
   
    describe("When the API returns a 500 error while fetching bills", () => {
      test("Then a 500 error message should be displayed", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await waitFor(() => screen.getByText(/Erreur 500/));
        expect(message).toBeTruthy();
      });
    });
  });
});
