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

  const sortedYears = Array.from(allYears).sort((a, b) => b - a);

  // Sort projects by year in descending order (most recent first)
  const sortedProjects = projects.sort((a, b) => b.year - a.year);

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
        yearTitle.textContent = year;
        yearGroup.appendChild(yearTitle);

        const grid = document.createElement("div");
        grid.className = "grid";

        yearProjects.forEach((project) => {
          const tile = document.createElement("div");
          tile.className = "project-tile";
          tile.innerHTML = `
                        <img src="${project.image}" alt="${project.title}">
                        <h3>${project.title}</h3>
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
      link.textContent = year;
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
        break; // Found the most recent visible year, so stop
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
