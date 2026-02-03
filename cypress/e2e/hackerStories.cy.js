describe('Hacker Stories', () => {
  const initialTerm = 'React'
  const newTerm = 'Cypress'  

  context('Hitting the API', () => {
    beforeEach(() => {
      //cy.intercept('GET', '**/search?query=React&page=0').as('stories')
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '0'
        }}).as('stories')
      cy.visit('/')

      cy.wait('@stories')
      //cy.contains('More').should('be.visible')
    })

    it('shows 20 stories, then the next 20 after clicking "More"', () => {
      cy.intercept({
        method: 'GET',
        pathname: '**/search',
        query: {
          query: initialTerm,
          page: '1'
        }}).as('nextStories')
      
      cy.get('.item').should('have.length', 20)

      cy.contains('More')
        .should('be.visible')
        .click()
      cy.assertLoadingIsShownAndHidden()
      cy.wait('@nextStories')

      cy.get('.item').should('have.length', 40)
    })

    it('searches via the last searched term', () => {
        cy.intercept({
          method: 'GET',
          pathname: `**/search`,
          query: {
            query: newTerm,
            page: '0'
          }
        }).as('newTermStories')

        cy.get('#search')
          .should('be.visible')
          .clear()
          .type(`${newTerm}{enter}`)

        cy.wait('@newTermStories')
        
        cy.getLocalStorage('search')
          .should('be.eq', newTerm)

        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
          .click()

        cy.wait('@stories')

        cy.getLocalStorage('search')
          .should('be.eq', initialTerm)

        cy.get('.item').should('have.length', 20)
        cy.get('.item')
          .first()
          .should('contain', initialTerm)
        cy.get(`button:contains(${newTerm})`)
          .should('be.visible')
      })
  })

  context('Mocking the API', ()  => {

    context('Footer and list of stories', () => {
      beforeEach(() => {
        //cy.intercept('GET', '**/search?query=React&page=0').as('stories')
        cy.intercept({
          method: 'GET',
          pathname: '**/search',
          query: {
            query: initialTerm,
            page: '0'
          }},
          {fixture: 'stories'}
        ).as('stories')

        cy.visit('/')
        cy.wait('@stories')
        //cy.contains('More').should('be.visible')
      })

      it('shows the footer', () => {
        cy.get('footer')
          .should('be.visible')
          .and('contain', 'Icons made by Freepik from www.flaticon.com')
      })

      context('List of stories', () => {
        const stories = require('../fixtures/stories.json')

        it('shows the right data for all rendered stories', () => {         

          cy.get('.item')
            .first()
            .should('be.visible')
            .and('contain', stories.hits[0].title)
            .and('contain', stories.hits[0].author)
            .and('contain', stories.hits[0].num_comments)
            .and('contain', stories.hits[0].points)
          cy.get(`.item a:contains(${stories.hits[0].title})`)
            .should('have.attr', 'href', stories.hits[0].url)

            cy.get('.item')
            .last()
            .should('be.visible')
            .and('contain', stories.hits[stories.hits.length - 1].title)
            .and('contain', stories.hits[stories.hits.length - 1].author)
            .and('contain', stories.hits[stories.hits.length - 1].num_comments)
            .and('contain', stories.hits[stories.hits.length - 1].points)
          cy.get(`.item a:contains(${stories.hits[stories.hits.length - 1].title})`)
            .should('have.attr', 'href', stories.hits[stories.hits.length - 1].url)
        })

        it('shows less stories after dimissing the first story', () => {
          cy.get('.button-small')
            .first()
            .should('be.visible')
            .click()

          cy.get('.item').should('have.length', 0)
        })
        
        
        context('Order by', () => {
          let storiesSorted = stories.hits

          it('orders by title', () => {
            storiesSorted.sort(function(a,b) {
              return a.title < b.title ? -1 : a.title > b.title ? 1 : 0;
            })

            cy.get('.list-header-button:contains(Title)')
              .as('titleHeader')
              .should('be.visible')
              .click()

            cy.get('.item').first()
              .should('be.visible')
              .and('contain', storiesSorted[0].title)
            cy.get(`.item a:contains(${storiesSorted[0].title})`)                            
              .should('have.attr', 'href', storiesSorted[0].url)


            cy.get('@titleHeader').click()

            cy.get('.item').first()
              .should('be.visible')
              .and('contain', storiesSorted[storiesSorted.length - 1].title)
            cy.get(`.item a:contains(${storiesSorted[storiesSorted.length - 1].title})`)                            
              .should('have.attr', 'href', storiesSorted[storiesSorted.length - 1].url)
          })

          it('orders by author', () => {
            storiesSorted.sort(function(a,b) {
              return a.author < b.author ? -1 : a.author > b.author ? 1 : 0;
            })

            cy.get('.list-header-button:contains(Author)')
              .as('authorHeader')
              .should('be.visible')
              .click()

            cy.get('.item').first()
              .should('be.visible')
              .and('contain', storiesSorted[0].author)

            cy.get('@authorHeader').click()

            cy.get('.item').first()
              .should('be.visible')
              .and('contain', storiesSorted[storiesSorted.length - 1].author)              
            
          })

          it('orders by comments', () => {
            storiesSorted.sort(function(a,b) {
              return a.num_comments < b.num_comments ? -1 : a.num_comments > b.num_comments ? 1 : 0;
            })

            cy.get('.list-header-button:contains(Comments)')
              .as('titleComments')
              .should('be.visible')
              .click()

            cy.get('.item').first()
              .should('be.visible')
              .and('contain', storiesSorted[storiesSorted.length - 1].num_comments)

            cy.get('@titleComments').click()

            cy.get('.item').first()
              .should('be.visible')
              .and('contain', storiesSorted[0].num_comments)            
          })

          it('orders by points', () => {
            storiesSorted.sort(function(a,b) {
              return a.points < b.points ? -1 : a.points > b.points ? 1 : 0;
            })

            cy.get('.list-header-button:contains(Points)')
              .as('titlePoints')
              .should('be.visible')
              .click()

            cy.get('.item').first()
              .should('be.visible')
              .and('contain', storiesSorted[storiesSorted.length - 1].points)

            cy.get('@titlePoints').click()

            cy.get('.item').first()
              .should('be.visible')
              .and('contain', storiesSorted[0].points)            
          })
        })
      })
    })

    context('Search', () => {
      beforeEach(() => {
        cy.intercept({
          method: 'GET',
          pathname: `**/search`,
          query: {
            query: initialTerm,
            page: '0'
          }},
          {fixture: 'empty'}
        ).as('emptyStories')

        cy.intercept({
          method: 'GET',
          pathname: `**/search`,
          query: {
            query: newTerm,
            page: '0'
          }},
          {fixture: 'stories'}
        ).as('stories')

        cy.visit('/')
        cy.wait('@emptyStories')

        cy.get('#search')
          .clear()
      })

      it('Shows no story when none is returned', () => {
        cy.get('.item').should('not.exist')
      })

      it('types and hits ENTER', () => {     
        cy.get('#search')
          .type(`${newTerm}{enter}`)

        cy.wait('@stories')

        cy.getLocalStorage('search')
          .should('be.eq', newTerm)

        cy.get('.item').should('have.length', 3)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      it('types and clicks the submit button', () => {
        cy.get('#search')
          .type(newTerm)
        cy.contains('Submit')
          .should('be.visible')
          .click()

        cy.wait('@stories')

        cy.getLocalStorage('search')
          .should('be.eq', newTerm)

        cy.get('.item').should('have.length', 3)
        cy.get(`button:contains(${initialTerm})`)
          .should('be.visible')
      })

      context('Last searches', () => {
        it('shows a max of 5 buttons for the last searched terms', () => {
          const { faker } = require ('@faker-js/faker')

          cy.intercept({
          method: 'GET',
          pathname: `**/search`},
          {fixture: 'empty'}
        ).as('fakerEmptyStories')

          cy.intercept('GET', `**/search**`).as('fakerStories')

          Cypress._.times(6, () => {
            const randomWord = faker.word.words(1)
            cy.get('#search')
              .clear()
              .type(`${randomWord}{enter}`)
            
            cy.wait('@fakerEmptyStories')

            cy.getLocalStorage('search')
              .should('be.eq', randomWord)
          })        

          /*cy.get('.last-searches button')
            .should('have.length', 5)*/

          cy.get('.last-searches') 
            .within(() => {
              cy.get('button')
                .should('have.length', 5)
            })
        })

        it('types and submits the form directly', () => {
          cy.get('form input[type="text"]')
            .should('be.visible')
            .clear()
            .type(newTerm)
          cy.get('form').submit()

          cy.wait('@stories')

          cy.get('.item').should('have.length', 3)
        })
      })
    })
  })
})



context('Errors', () => {
  it('shows "Something went wrong ..." in case of a server error', () => {
    cy.intercept('GET', '**/search**', {statusCode: 500}).as('serverFailure')

    cy.visit('/')
    cy.wait('@serverFailure')

    cy.get('p:contains(Something went wrong ...)').should('be.visible')
  })

  it('shows "Something went wrong ..." in case of a network error', () => {
    cy.intercept('GET', '**/search**', {forceNetworkError: true}).as('networkFailure')

    cy.visit('/')
    cy.wait('@networkFailure')

    cy.get('p:contains(Something went wrong ...)').should('be.visible')
  })    
})

it('shos a "loading..." state before showing the results', () => {
  cy.intercept('GET', '**/search**', 
    {
      delay: 1000,
      fixture: 'stories'
    }
  ).as('delayedStories')

  cy.visit('/')

  cy.assertLoadingIsShownAndHidden()
  cy.wait('@delayedStories')

  cy.fixture('stories').then((stories) => {
    cy.get('.item').should('have.length', stories.hits.length)
  })
})