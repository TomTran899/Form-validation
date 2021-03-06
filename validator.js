// Đối tượng: Constructor Function
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    // Hàm thực hiện Validate
    function validate(inputElement, rule) {
        // var errorElement = getParent(inputElement, '.form-group')
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
        var errorMessage;

        // Lấy ra các rules của Selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng rule & kiểm tra
        // Nếu có lỗi thì dừng kiểm tra
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case "checkbox":
                case "radio":
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ":checked"));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
            errorElement.innerHTML = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add("invalid");
        } else {
            errorElement.innerHTML = "";
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
        }
        return !errorMessage;
    }

    // Lấy element của form cần validate
    var formElement = document.querySelector(options.form);
    var submitElement = document.querySelector("#form-1 .form-submit");

    if (formElement) {
        submitElement.onclick = function (e) {
            e.preventDefault();
            var isFormValid = true;

            // lặp qua từng rule và validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            if (isFormValid) {
                // Trường hợp Submit bằng JS
                if (typeof options.onSubmit === "function") {
                    var enableInputs = formElement.querySelectorAll("[name]:not([disabled])");
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch (input.type) {
                            case "radio":
                            case "checkbox":
                                if (input.matches(":checked")) {
                                    values[input.name] = input.value;
                                }
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    options.onSubmit(formValues);
                }
            }
        };
        options.rules.forEach(function (rule) {
            // Lưu lại các rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }
            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                // Xử lý blur ra khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                };

                // Xử lý khi đang nhập
                inputElement.oninput = function () {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerHTML = "";
                    getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
                };
            }
        });
    }
}

/* Định nghĩa các rules
      Nguyễn tắc của các rules
        1. Khi có lỗi => Message lỗi
        2. Khi hợp lệ => không trả gì cả      
*/

Validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : "Vui lòng nhập trường này";
        },
    };
};
Validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : "Email không hợp lệ";
        },
    };
};
Validator.minLength = function (selector, min) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`;
        },
    };
};
Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || "Giá trị xác thực không khớp";
            // Ở đây có nghĩa là, nếu có truyền tham số message thì in message, không thì in ' Giá trị....'
        },
    };
};
