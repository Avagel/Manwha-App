export const reducer = (state, action) => {
  if (action.type == "CHANGE_PAGE") {
    switch (action.payload) {
      case "reading":
        return <ReadingPage />;
      case "discover":
        return <DiscoverPage />;
      case "library":
        return <LibraryPage />;
      case "history":
        return <HistoryPage />;
      case "overview":
        return <OverviewPage />;
    }
  }
  return;
};
