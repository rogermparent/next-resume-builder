describe("Single Resume View", () => {
  describe("with the two resumes fixture", () => {
    beforeEach(() => {
      cy.resetData("two-pages");
      cy.visit("http://localhost:3000/resume/resume-5");
    });

    it("should display a resume", () => {
      cy.findByText("Company 5");
    });

    it("should not need authorization", () => {
      cy.findByText("Sign In");
    });

    it("should be able to edit a resume", () => {
      cy.findByText("Edit").click();

      cy.fillSignInForm();

      cy.findByText("Editing resume: Company 5");

      cy.findByText("Advanced").click();

      const editedCompany = "Edited Company";

      cy.findAllByLabelText("Company").first().clear().type(editedCompany);

      const resumeDate = "2023-12-08T01:16:04.1";
      cy.findByLabelText("Date (UTC)").should("have.value", resumeDate);

      cy.findByText("Submit").click();

      cy.findByText(editedCompany);

      cy.visit("http://localhost:3000/");
      cy.findByText(editedCompany);
      cy.checkCompaniesInOrder(["Company 6", editedCompany, "Company 4"]);

      // Resume date should not have changed
      cy.findByText(new Date(resumeDate + "Z").toLocaleString());
    });

    it("should be able to delete the resume", () => {
      cy.findByText("Delete").click();

      // First click of the delete button should trigger a sign-in
      cy.fillSignInForm();

      cy.findByText("Delete").click();

      cy.findByText("Company 3");
      cy.checkCompaniesInOrder(["Company 6", "Company 4", "Company 3"]);
      cy.request({
        url: "http://localhost:3000/resume/resume-5",
        failOnStatusCode: false,
      })
        .its("status")
        .should("equal", 404);
    });
  });

  it("should have status 404 when resume doesn't exist", () => {
    cy.request({
      url: "http://localhost:3000/resume/non-existent-resume",
      failOnStatusCode: false,
    })
      .its("status")
      .should("equal", 404);
  });
});
