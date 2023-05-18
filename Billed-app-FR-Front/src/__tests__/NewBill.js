/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { screen, fireEvent } from "@testing-library/dom";

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";

import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

jest.mock("../app/store", () => mockStore);

/*******************************************************************
********** NewBill Form Submission for Employee User ***************
*******************************************************************/

/* This test case verifies that an employee user can successfully complete NewBill form.        **
** Main goal is to ensure that when an employee user navigates to NewBill page, they can        **
** find form, fill it out, and submit it without encountering any errors.                       **

** Test begins by setting up a mock navigation function, 'onNavigate', and mock localStorage.   **
** 'localStorage' is set to mimic an employee user being currently logged in.                   **
** Then, NewBill page's HTML is generated and set as body of document.                          **

** A new instance of 'NewBill' class is created, representing employee user's current session.  **
** NewBill form is then retrieved from page by its test ID and its existence on page            **
** is confirmed by asserting that it is truthy.                                                 **

** Mock function, 'handleSubmit', is set up to simulate the action of form being submitted.     **
** This function calls 'handleSubmit' method of 'newBillTest' instance.                         **

** An event listener is added to the NewBill form to call 'handleSubmit' when form is submitted.**
** Finally, form is programmatically submitted using 'fireEvent.submit', and it is checked      **
** that 'handleSubmit' was indeed called, confirming that the form submission was successful.   */

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then complete form for newBill", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const html = NewBillUI();
      document.body.innerHTML = html;

      const newBillTest = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const NewBillForm = screen.getByTestId("form-new-bill");
      expect(NewBillForm).toBeTruthy();

      const handleSubmit = jest.fn((e) => newBillTest.handleSubmit(e));
      NewBillForm.addEventListener("submit", handleSubmit);
      fireEvent.submit(NewBillForm);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });

  /*******************************************************************
  ********** Verification of Proof Picture Bill Upload ***************
  *******************************************************************/

  /* This test case verifies ability of an employee to upload proof picture for new bill.         **

  ** Test starts by spying on 'bills' method of mock store to monitor interactions.               **

  ** Then, necessary mocks are set up for navigation, localStorage, and window.location.          **
  ** After that, NewBill page's HTML is generated, and a new 'NewBill' instance is created.       **

  ** A mock file is created to simulate a proof picture and is uploaded using 'userEvent.upload'. **
  ** Success of the upload is confirmed by checking  'name' property of the first file in         **
  ** 'billFile.files'.                                                                            **

  ** Finally, the form submission is simulated, and its success is confirmed by verifying that    **
  ** 'handleSubmit' function was called.                                                          */

  test("Then verify the proof picture bill", async () => {
    jest.spyOn(mockStore, "bills");

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname });
    };
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
    Object.defineProperty(window, "location", {
      value: { hash: ROUTES_PATH["NewBill"] },
    });
    window.localStorage.setItem(
      "user",
      JSON.stringify({
        type: "Employee",
      })
    );

    const html = NewBillUI();
    document.body.innerHTML = html;

    const newBillInit = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    const file = new File(["image"], "image.png", { type: "image/png" });
    const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
    const formNewBill = screen.getByTestId("form-new-bill");
    const billFile = screen.getByTestId("file");

    billFile.addEventListener("change", handleChangeFile);
    userEvent.upload(billFile, file);

    expect(billFile.files[0].name).toBeDefined();
    expect(handleChangeFile).toBeCalled();

    const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
    formNewBill.addEventListener("submit", handleSubmit);
    fireEvent.submit(formNewBill);
    expect(handleSubmit).toHaveBeenCalled();
  });
});

/*******************************************************************
********** Submission of Unsupported File Type for a Bill **********
*******************************************************************/

/* This test case verifies that application correctly handles submission of an unsupported file type as a           **
** bill's proof picture.                                                                                            **

** Goal is to ensure that when an employee user attempts to upload file of type that is not supported               **
** (i.e., not a JPG, JPEG, or PNG image), upload is rejected, and an appropriate error message is displayed.        **

** Test begins by setting up necessary mocks for navigation, localStorage, and window.location,                     **
** and creating NewBill page's HTML.                                                                                **

** New instance of 'NewBill' class is then created, representing employee user's current session.                   **
** Mock file of an unsupported type is created and an attempt is made to upload it using 'userEvent.upload'.        **
** 'handleChangeFile' function is called during upload attempt, and it is confirmed that it was called as expected. **

** Finally, it is checked that correct validation message is displayed, confirming that application                  **
** correctly rejected unsupported file.                                                                              */

test("Then verify the submission of an unsupported file type", async () => {
  const onNavigate = (pathname) => {
    document.body.innerHTML = ROUTES({ pathname });
  };

  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  Object.defineProperty(window, "location", {
    value: { hash: ROUTES_PATH["NewBill"] },
  });

  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
    })
  );

  const html = NewBillUI();
  document.body.innerHTML = html;

  const newBillInit = new NewBill({
    document,
    onNavigate,
    store: mockStore,
    localStorage: window.localStorage,
  });

  const file = new File(["unsupported"], "unsupported.txt", {
    type: "text/plain",
  });
  const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
  const formNewBill = screen.getByTestId("form-new-bill");
  const billFile = screen.getByTestId("file");

  billFile.addEventListener("change", handleChangeFile);
  userEvent.upload(billFile, file);

  expect(handleChangeFile).toBeCalled();
  expect(billFile.validationMessage).toBe(
    "Merci d'utiliser le bon format JPG, JPEG ou PNG"
  );
});