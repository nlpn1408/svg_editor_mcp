# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-02

### Added
- Complete refactor to match Clean Architecture structure
- `search_code` - Search by architecture layer
- `get_module_map` - Map structure by layer/feature
- `find_domain_logic` - Find business logic in entities/services
- `find_architecture_violations` - Detect rule violations
- `get_entity_relationships` - Map entity dependencies
- Full documentation with examples
- Setup scripts for Windows and Unix
- Token-optimized outputs

### Changed
- Updated all paths to match real Clean Architecture structure
- Improved error handling and user feedback
- Better categorization of search results

### Fixed
- Hardcoded `src/modules/` paths (now uses actual structure)
- `find_domain_logic` implementation (was mock, now real)
- Path resolution for different project structures

### Removed
- Legacy hardcoded structure assumptions

## [1.0.0] - 2025-XX-XX (Deprecated)

### Added
- Initial MCP server implementation
- Basic search functionality
- Module mapping (non-functional due to wrong paths)

### Issues
- Hardcoded structure didn't match real projects
- Tools never returned results
- Missing implementations
