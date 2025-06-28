document.addEventListener("DOMContentLoaded", () => {
  const projectGrid = document.getElementById("project-grid");
  const tagFilters = document.getElementById("tag-filters");
  const timelineNav = document.getElementById("timeline-nav");
  const activeFilterSpan = document.getElementById("active-filter");
  const clearFilterButton = document.getElementById("clear-filter");

  let allTags = new Set();
  let allYears = new Set();
  let activeTag = null;

  const getCategory = (tag) => {
    const parts = tag.split(":");
    return parts.length > 1 ? parts[0] : ""; // Return category or empty string for base tags
  };

  // Define custom tag category order
  const tagCategoryOrder = ["work", "tech"];

  projects.forEach((project) => {
    project.tags.forEach((tag) => allTags.add(tag));
    allYears.add(project.year);
  });

  // Custom sort function for tags
  const sortedTags = Array.from(allTags).sort((a, b) => {
    const getCategory = (tag) => {
      const parts = tag.split(":");
      return parts.length > 1 ? parts[0] : ""; // Return category or empty string for base tags
    };

    const categoryA = getCategory(a);
    const categoryB = getCategory(b);

    const indexA = tagCategoryOrder.indexOf(categoryA);
    const indexB = tagCategoryOrder.indexOf(categoryB);

    // Sort by category order first
    if (indexA !== -1 && indexB !== -1) {
      if (indexA !== indexB) {
        return indexA - indexB;
      }
    } else if (indexA !== -1) {
      return -1; // Category A comes before uncategorized B
    } else if (indexB !== -1) {
      return 1; // Uncategorized A comes after Category B
    }

    // Then sort alphabetically within the same category or for uncategorized tags
    return a.localeCompare(b);
  });

  const sortedYears = Array.from(allYears).sort((a, b) => {
    if (a === 0) return -1;
    if (b === 0) return 1;
    return b - a;
  });

  // Sort projects by year in descending order (most recent first)
  const sortedProjects = projects.sort((a, b) => {
    if (a.year === 0) return -1;
    if (b.year === 0) return 1;
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return a.title.localeCompare(b.title);
  });

  function renderProjects(filterTag = null) {
    projectGrid.innerHTML = "";
    activeTag = filterTag;
    activeFilterSpan.textContent = activeTag || ""; // No text when no filter
    if (activeTag) {
      activeFilterSpan.style.display = "inline-block";
      clearFilterButton.style.display = "inline-block";
    } else {
      activeFilterSpan.style.display = "none";
      clearFilterButton.style.display = "none";
    }

    let filteredProjects = sortedProjects;
    if (filterTag) {
      filteredProjects = sortedProjects.filter((p) =>
        p.tags.includes(filterTag)
      );
    }

    const projectsByYear = sortedYears.reduce((acc, year) => {
      const yearProjects = filteredProjects
        .filter((p) => p.year === year)
        .sort((a, b) => a.title.localeCompare(b.title));
      if (yearProjects.length > 0) {
        acc[year] = yearProjects;
      }
      return acc;
    }, {});

    sortedYears.forEach((year) => {
      const yearProjects = projectsByYear[year];
      if (yearProjects) {
        const yearGroup = document.createElement("div");
        yearGroup.className = "year-group";
        yearGroup.id = `year-${year}`;

        const yearTitle = document.createElement("h2");
        yearTitle.textContent = year === 0 ? "Currently working" : year;
        yearGroup.appendChild(yearTitle);

        const grid = document.createElement("div");
        grid.className = "grid";

        yearProjects.forEach((project) => {
          const tile = document.createElement("div");
          tile.className = "project-tile";
          const linkIcon = project.link
            ? ` <a href="${project.link}" target="_blank" class="project-link" title="Open project link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                    <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                  </svg>
                </a>`
            : "";

          const repoIcon = project.repo
            ? ` <a href="${project.repo}" target="_blank" class="project-link" title="Open project repository">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-github" viewBox="0 0 16 16">
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                  </svg>
                </a>`
            : "";

          const icons =
            linkIcon || repoIcon
              ? `<div class="project-icons">${linkIcon}${repoIcon}</div>`
              : "";

          tile.innerHTML = `
                        <img src="${project.image}" alt="${project.title}">
                        <h3>
                          <span>${project.title}</span>
                          ${icons}
                        </h3>
                        <p>${project.description}</p>
                        <div class="tags">${project.tags
                          .map((t) => `<span>${t}</span>`)
                          .join("")}</div>
                    `;
          grid.appendChild(tile);
        });
        yearGroup.appendChild(grid);
        projectGrid.appendChild(yearGroup);
      }
    });

    highlightCurrentYear();
  }

  function renderFilters() {
    let lastCategory = null;
    sortedTags.forEach((tag) => {
      const button = document.createElement("button");
      button.textContent = tag;

      const currentCategory = getCategory(tag);
      if (lastCategory !== null && currentCategory !== lastCategory) {
        button.classList.add("category-separator");
      }
      lastCategory = currentCategory;

      button.onclick = () => {
        if (activeTag === tag) {
          renderProjects(null);
        } else {
          renderProjects(tag);
        }
        updateFilterButtons();
      };
      tagFilters.appendChild(button);
    });
  }

  function updateFilterButtons() {
    const buttons = tagFilters.querySelectorAll("button");
    buttons.forEach((b) => {
      if (b.textContent === activeTag) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
  }

  clearFilterButton.onclick = () => {
    renderProjects(null);
    updateFilterButtons();
  };

  function renderTimeline() {
    sortedYears.forEach((year) => {
      const link = document.createElement("a");
      link.href = `#year-${year}`;
      link.textContent = year === 0 ? "Now" : year;
      link.onclick = (e) => {
        e.preventDefault();
        document
          .getElementById(`year-${year}`)
          .scrollIntoView({ behavior: "smooth" });
      };
      timelineNav.appendChild(link);
    });
  }

  function highlightCurrentYear() {
    const yearGroups = document.querySelectorAll(".year-group");
    const timelineLinks = timelineNav.querySelectorAll("a");
    let currentYearId = "";

    // Iterate in reverse to find the most recent year that is currently visible
    for (let i = yearGroups.length - 1; i >= 0; i--) {
      const group = yearGroups[i];
      const rect = group.getBoundingClientRect();

      // If the top of the group is within or above the viewport, and the bottom is below the top of the viewport
      // This means the group is currently visible, or has just scrolled past the top
      if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        currentYearId = group.id;
      }
    }

    timelineLinks.forEach((link) => {
      if (link.getAttribute("href") === `#${currentYearId}`) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  renderProjects();
  renderFilters();
  renderTimeline();

  // Force the newest year to be active on page load
  if (sortedYears.length > 0) {
    const newestYear = sortedYears[0];
    const newestYearLink = timelineNav.querySelector(
      `a[href="#year-${newestYear}"]`
    );
    if (newestYearLink) {
      newestYearLink.classList.add("active");
    }
  }

  window.addEventListener("scroll", highlightCurrentYear);
});
